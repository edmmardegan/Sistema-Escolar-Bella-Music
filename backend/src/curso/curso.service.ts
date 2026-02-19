import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Curso } from '../entities/curso.entity';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';

@Injectable()
export class CursoService {
  constructor(
    @InjectRepository(Curso)
    private readonly repository: Repository<Curso>,
  ) {}

  async findAll() {
    return await this.repository.find({ order: { nome: 'ASC' } });
  }

  // Agora o TypeScript vai reconhecer o que é CreateCursoDto e UpdateCursoDto
  async save(dados: CreateCursoDto | (UpdateCursoDto & { id?: number })) {
    return await this.repository.save(dados);
  }

  async remove(id: number) {
    const registro = await this.repository.findOneBy({ id });
    if (!registro) throw new NotFoundException('Curso não encontrado');
    return await this.repository.delete(id);
  }
}
