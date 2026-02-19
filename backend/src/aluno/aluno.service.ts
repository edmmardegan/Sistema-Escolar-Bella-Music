// Local: src/aluno/aluno.service.ts

import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aluno } from '../entities/aluno.entity';
import { CreateAlunoDto } from './dto/create-aluno.dto';

@Injectable()
export class AlunoService {
  constructor(
    @InjectRepository(Aluno)
    private readonly repository: Repository<Aluno>,
  ) {}

  // AJUSTADO: Agora traz as matrículas e os cursos vinculados
  async findAll() {
    return await this.repository.find({
      relations: ['matriculas', 'matriculas.curso'], // Carrega os dados relacionados
      order: { nome: 'ASC' },
    });
  }

  // PADRÃO: Criar ou Atualizar
  // Usamos o DTO para garantir que os dados de entrada respeitem as regras do sistema
  async save(dados: CreateAlunoDto & { id?: number }) {
    try {
      return await this.repository.save(dados);
    } catch (error) {
      // Caso ocorra erro de CPF duplicado, por exemplo, o banco lançará uma exceção aqui
      if (error.code === '23505') {
        throw new InternalServerErrorException(
          'Este CPF já está cadastrado para outro aluno.',
        );
      }
      throw new InternalServerErrorException(
        'Erro ao salvar os dados do aluno.',
      );
    }
  }

  // PADRÃO: Remover
  async remove(id: number) {
    const registro = await this.repository.findOneBy({ id });
    if (!registro) throw new NotFoundException('Aluno não encontrado');
    return await this.repository.delete(id);
  }

  // BUSCA: Aniversariantes do dia
  async buscarAniversariantes() {
    try {
      const hoje = new Date();
      const mes = hoje.getMonth() + 1;
      const dia = hoje.getDate();

      return await this.repository
        .createQueryBuilder('aluno')
        .where('EXTRACT(MONTH FROM aluno.dataNascimento) = :mes', { mes })
        .andWhere('EXTRACT(DAY FROM aluno.dataNascimento) = :dia', { dia })
        .getMany();
    } catch (error) {
      console.error('Erro na busca de aniversariantes:', error);
      throw new InternalServerErrorException(
        'Erro ao processar busca de aniversariantes',
      );
    }
  }
}
