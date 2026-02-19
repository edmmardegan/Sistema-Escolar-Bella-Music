import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
  ) {
    if (userData.id) {
      const id = userData.id;
      const dadosParaAtualizar = { ...userData };
      delete (dadosParaAtualizar as any).id;

      // Se houver senha na atualização, precisamos criptografar
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
      return this.userRepository.findOneBy({ id });
    }

    // Lógica de Criação
    const passwordToHash = (userData as any).senha || '123456';
    const hashedPassword = await bcrypt.hash(passwordToHash, 10);

    const newUser = this.userRepository.create({
      ...userData,
      senha: hashedPassword,
      primeiroAcesso: true,
    } as DeepPartial<User>);

    return await this.userRepository.save(newUser);
  }

  async remove(id: number) {
    const registro = await this.userRepository.findOneBy({ id });
    if (!registro) throw new NotFoundException('Usuário não encontrado');
    return await this.userRepository.delete(id);
  }

  async updatePassword(id: number, novaSenha: string, forcarTroca: boolean) {
    const hashedPassword = await bcrypt.hash(novaSenha, 10);

    return await this.userRepository.update(id, {
      senha: hashedPassword,
      primeiroAcesso: forcarTroca,
    } as QueryDeepPartialEntity<User>);
  }
}
