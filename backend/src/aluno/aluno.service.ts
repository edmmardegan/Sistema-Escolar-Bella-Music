// Local: src/aluno/aluno.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aluno } from '../entities/aluno.entity';

@Injectable()
export class AlunoService {
  constructor(
    @InjectRepository(Aluno)
    private readonly repository: Repository<Aluno>,
  ) {}

  // PADRÃO: Listar todos
  async findAll() {
    return await this.repository.find({ order: { nome: 'ASC' } });
  }

  // PADRÃO: Criar ou Atualizar (save é inteligente)
  async save(dados: Partial<Aluno>) {
    return await this.repository.save(dados);
  }

  // PADRÃO: Remover
  async remove(id: number) {
    const registro = await this.repository.findOneBy({ id });
    if (!registro) throw new NotFoundException('Aluno não encontrado');
    return await this.repository.delete(id);
  }
}
