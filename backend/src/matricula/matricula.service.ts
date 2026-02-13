import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Matricula } from '../entities/matricula.entity';
import { MatriculaTermo } from '../entities/matricula-termo.entity';
import { Aula } from '../entities/aula.entity';
import { CreateMatriculaDto } from './dto/create-matricula.dto';
import { UpdateTermoDto } from './dto/update-termo.dto';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class MatriculaService {
  constructor(
    @InjectRepository(Matricula)
    private readonly repository: Repository<Matricula>,

    @InjectRepository(MatriculaTermo)
    private readonly termoRepo: Repository<MatriculaTermo>,
  ) {}

  // PADRÃO: Listar todas
  async findAll() {
    return await this.repository.find({
      relations: ['aluno', 'curso', 'termos'],
      order: { aluno: { nome: 'ASC' } },
    });
  }

  async save(data: CreateMatriculaDto & { id?: number }) {
    const dataTerminoLimpa =
      data.dataTermino && String(data.dataTermino).trim() !== ''
        ? data.dataTermino
        : null;

    if (data.id) {
      const id = data.id;

      // Criamos uma cópia e deletamos o id de dentro dela
      const dadosParaAtualizar = { ...data };
      delete (dadosParaAtualizar as any).id;

      await this.repository.update(id, {
        ...dadosParaAtualizar,
        dataTermino: dataTerminoLimpa,
      } as QueryDeepPartialEntity<Matricula>);

      return this.repository.findOne({
        where: { id },
        relations: ['aluno', 'curso'],
      });
    }

    // Na criação, usamos DeepPartial para o .create()
    const nova = this.repository.create({
      ...data,
      dataTermino: dataTerminoLimpa,
    } as DeepPartial<Matricula>);

    const salvo = await this.repository.save(nova);

    // ... restante da lógica de automação de aulas (mantém igual)
    const matCompleta = await this.repository.findOne({
      where: { id: salvo.id },
      relations: ['curso'],
    });

    if (!matCompleta) return null;

    if (matCompleta.curso?.qtdeTermos) {
      const dataAula = new Date(matCompleta.dataInicio);
      dataAula.setHours(12, 0, 0, 0);
      const intervalo = matCompleta.frequencia === 'Quinzenal' ? 14 : 7;

      for (let i = 1; i <= matCompleta.curso.qtdeTermos; i++) {
        const termo = await this.termoRepo.save({
          numeroTermo: i,
          matricula: matCompleta,
          nota1: 0,
          nota2: 0,
        });

        for (let semana = 0; semana < 4; semana++) {
          await this.termoRepo.manager.save(Aula, {
            termo: termo,
            data: new Date(dataAula),
            status: 'Pendente',
          });
          dataAula.setDate(dataAula.getDate() + intervalo);
        }
      }
    }
    return matCompleta;
  }

  async updateTermo(id: number, data: UpdateTermoDto) {
    // CORREÇÃO: Tipamos aqui também para evitar o aviso
    await this.termoRepo.update(id, {
      nota1: data.nota1,
      nota2: data.nota2,
      dataProva1: data.dataProva1,
      dataProva2: data.dataProva2,
      obs: data.obs,
    } as QueryDeepPartialEntity<MatriculaTermo>);

    return await this.termoRepo.findOne({
      where: { id },
      relations: ['matricula.aluno'],
    });
  }

  // PADRÃO: Remover
  async remove(id: number) {
    return await this.repository.delete(id);
  }

  async getDetalhesBoletim(termoId: number) {
    const termo = await this.termoRepo.findOne({
      where: { id: termoId },
      relations: ['matricula'],
    });
    if (!termo) throw new NotFoundException('Termo não encontrado');

    const fullMat = await this.repository.findOne({
      where: { id: termo.matricula.id },
      relations: ['aluno', 'curso', 'termos.aulas'],
      order: { termos: { numeroTermo: 'ASC' } },
    });

    if (!fullMat) {
      throw new NotFoundException('Matrícula não encontrada para este termo');
    }

    return {
      alunoNome: fullMat.aluno.nome,
      cursoNome: fullMat.curso?.nome || 'Curso',
      todosOsTermos: fullMat.termos.map((t) => ({
        ...t,
        aulasRealizadas:
          t.aulas?.filter((a) => a.status === 'Presente').length || 0,
      })),
    };
  }
}
