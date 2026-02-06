// Local: src/curso/curso.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Curso } from '../entities/curso.entity';

@Injectable()
export class CursoService {
  constructor(
    @InjectRepository(Curso)
    private readonly repository: Repository<Curso>,
  ) {}

  // PADRÃO: Listar todos
  async findAll() {
    return await this.repository.find({ order: { nome: 'ASC' } });
  }

  // PADRÃO: Salvar (Criar ou Atualizar)
  async save(dados: Partial<Curso>) {
    return await this.repository.save(dados);
  }

  // PADRÃO: Remover
  async remove(id: number) {
    const registro = await this.repository.findOneBy({ id });
    if (!registro) throw new NotFoundException('Curso não encontrado');
    return await this.repository.delete(id);
  }
}
