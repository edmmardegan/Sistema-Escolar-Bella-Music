//Local: src/usuarios/users.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  // PADRÃO: Listar todos
  async findAll() {
    return await this.repository.find({
      select: ['id', 'nome', 'email', 'role', 'primeiroAcesso'],
      order: { nome: 'ASC' },
    });
  }

  // --- A FUNÇÃO QUE ESTAVA FALTANDO PARA O AUTH SERVICE ---
  async findOne(identificador: string): Promise<User | null> {
    return await this.repository.findOne({
      where: [{ email: identificador }, { username: identificador }],
    });
  }

  // PADRÃO: Salvar (Criar ou Atualizar)
  async save(userData: any) {
    if (userData.id) {
      await this.repository.update(userData.id, {
        nome: userData.nome,
        email: userData.email,
        role: userData.role,
      });
      return this.repository.findOneBy({ id: userData.id });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userData.senha || '123456', salt);

    const newUser = this.repository.create({
      ...userData,
      username: userData.email,
      senha: hashedPassword,
      primeiroAcesso: true,
    });

    return await this.repository.save(newUser);
  }

  // PADRÃO: Remover
  async remove(id: number) {
    const registro = await this.repository.findOneBy({ id });
    if (!registro) throw new NotFoundException('Usuário não encontrado');
    return await this.repository.delete(id);
  }

  // ESPECÍFICO: Resets de Senha
  async updatePassword(id: number, novaSenha: string, forcarTroca: boolean) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(novaSenha, salt);
    return await this.repository.update(id, {
      senha: hashedPassword,
      primeiroAcesso: forcarTroca,
    });
  }

  async findByEmail(email: string) {
    return this.repository.findOne({ where: { email } });
  }
}
