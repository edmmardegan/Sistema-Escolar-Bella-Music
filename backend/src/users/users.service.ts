//Local: /src/users/users.service.ts

import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuditService } from 'src/audit/audit.service';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly auditService: AuditService,
  ) {}

  // 1. Executa automaticamente quando o servidor inicia
  async onModuleInit() {
    await this.criarAdminPadrao();
  }

  async criarAdminPadrao() {
    const emailAdmin = 'admin@bellamusic.com';

    // Verifica se já existe para não duplicar toda vez que o server reiniciar
    const jaExiste = await this.userRepository.findOne({
      where: { email: emailAdmin },
    });

    if (!jaExiste) {
      const hash = await bcrypt.hash('admin123', 10);
      await this.userRepository.save({
        nome: 'Administrador',
        email: emailAdmin,
        senha: hash,
        role: 'admin',
        primeiroAcesso: true,
      } as any);
      console.log(
        '✅ LOG: Usuário Admin criado (admin@bellamusic.com / admin123)',
      );
    }
  }

  async findAll() {
    return await this.userRepository.find({
      select: ['id', 'nome', 'email', 'role', 'primeiroAcesso'],
      order: { nome: 'ASC' },
    });
  }

  async findOne(identificador: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email: identificador }, // Simplificado para evitar erro de array no where
    });
  }

  async save(
    userData: (Partial<CreateUserDto> | Partial<UpdateUserDto>) & {
      id?: number;
    },
    userName: string = 'SISTEMA',
  ) {
    // ✅ Função tipada para evitar o erro de 'any' e o membro inseguro
    const limparParaLog = (obj: any): Record<string, any> => {
      if (!obj) return {};
      const clone = { ...obj } as Record<string, any>;
      delete clone.senha; // 🛡️ Remove a chave do cofre
      delete clone.id; // Opcional: remover o ID se quiser um log mais limpo
      return clone;
    };

    if (userData.id) {
      const id = userData.id;

      const antes = await this.userRepository.findOneBy({ id });

      const dadosParaAtualizar = { ...userData };
      delete (dadosParaAtualizar as any).id;

      if ((dadosParaAtualizar as any).senha) {
        (dadosParaAtualizar as any).senha = await bcrypt.hash(
          (dadosParaAtualizar as any).senha,
          10,
        );
      }

      await this.userRepository.update(
        id,
        dadosParaAtualizar as QueryDeepPartialEntity<User>,
      );

      const depois = await this.userRepository.findOneBy({ id });

      // 🛡️ Auditoria com dados limpos
      await this.auditService.createLog(
        'usuarios',
        'UPDATE',
        limparParaLog(antes),
        limparParaLog(depois),
        userName,
      );

      return depois;
    }

    // --- CRIAÇÃO ---
    const passwordToHash = (userData as any).senha || '123456';
    const hashedPassword = await bcrypt.hash(passwordToHash, 10);

    const newUser = this.userRepository.create({
      ...userData,
      senha: hashedPassword,
      primeiroAcesso: true,
    } as DeepPartial<User>);

    const salvo = await this.userRepository.save(newUser);

    // 🛡️ Auditoria de Inserção
    await this.auditService.createLog(
      'usuarios',
      'INSERT',
      {},
      limparParaLog(salvo),
      userName,
    );

    return salvo;
  }

  // --- AJUSTE NO REMOVE ---
  async remove(id: number, userName: string = 'SISTEMA') {
    const registro = await this.userRepository.findOneBy({ id });
    if (!registro) throw new NotFoundException('Usuário não encontrado');

    // 🛡️ Log de Delete
    const dadosLog = { nome: registro.nome, email: registro.email };
    await this.auditService.createLog(
      'usuarios',
      'DELETE',
      dadosLog,
      {},
      userName,
    );

    return await this.userRepository.delete(id);
  }

  // --- AJUSTE NO UPDATE PASSWORD ---
  async updatePassword(
    id: number,
    novaSenha: string,
    forcarTroca: boolean,
    userName: string = 'SISTEMA',
  ) {
    console.log('--- TENTANDO RESETAR SENHA ---');
    console.log('ID recebido:', id);
    console.log('Senha recebida (tamanho):', novaSenha?.length);
    // 1. Busca o usuário antes para saber o nome no log
    const usuario = await this.userRepository.findOneBy({ id });

    if (!usuario) {
      throw new NotFoundException(
        'Usuário não encontrado para alteração de senha',
      );
    }

    // 2. Criptografa a nova senha
    const hashedPassword = await bcrypt.hash(novaSenha, 10);

    // 3. Atualiza no banco
    await this.userRepository.update(id, {
      senha: hashedPassword,
      primeiroAcesso: forcarTroca,
    } as QueryDeepPartialEntity<User>);

    // 4. AUDITORIA: Registra a ação sem salvar a senha
    await this.auditService.createLog(
      'usuarios',
      'UPDATE',
      { nome: usuario.nome, email: usuario.email, acao: 'Troca de senha' },
      {
        nome: usuario.nome,
        email: usuario.email,
        acao: 'Senha alterada com sucesso',
      },
      userName,
    );

    return { success: true };
  }
}
