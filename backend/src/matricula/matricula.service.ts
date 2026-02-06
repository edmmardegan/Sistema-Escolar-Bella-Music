//Local: src/matricula/matricula.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Matricula } from '../entities/matricula.entity';
import { MatriculaTermo } from '../entities/matricula-termo.entity';
import { Aula } from '../entities/aula.entity';

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

  // PADRÃO: Criar (Com automação de aulas/termos)
  async save(data: any) {
    // CORREÇÃO: Tratamento para evitar erro de string vazia em campos de data no Postgres
    const dataTerminoLimpa =
      data.dataTermino && String(data.dataTermino).trim() !== ''
        ? data.dataTermino
        : null;

    // Se tiver ID, é atualização simples
    if (data.id) {
      await this.repository.update(data.id, {
        ...data,
        dataTermino: dataTerminoLimpa,
      });

      return this.repository.findOne({
        where: { id: data.id },
        relations: ['aluno', 'curso'],
      });
    }

    // Se não tiver ID, é criação com automação
    // Espalhamos o data mas sobrescrevemos a dataTermino com o valor limpo
    const nova = this.repository.create({
      ...data,
      dataTermino: dataTerminoLimpa,
    } as Matricula);

    const salvo = await this.repository.save(nova);

    const matCompleta = await this.repository.findOne({
      where: { id: salvo.id },
      relations: ['curso'],
    });

    // Se a matrícula não foi encontrada por algum erro bizarro, paramos aqui
    if (!matCompleta) return null;

    // Automação de Termos e Aulas
    if (matCompleta.curso?.qtdeTermos) {
      const dataAula = new Date(matCompleta.dataInicio);
      dataAula.setHours(12, 0, 0, 0); // Evita problemas de fuso horário

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

  // PADRÃO: Remover
  async remove(id: number) {
    return await this.repository.delete(id);
  }

  // ESPECÍFICO: Boletim e Termos
  async updateTermo(id: number, data: any) {
    await this.termoRepo.update(id, {
      nota1: data.nota1,
      nota2: data.nota2,
      dataProva1: data.dataProva1,
      dataProva2: data.dataProva2,
      obs: data.obs,
    });
    return await this.termoRepo.findOne({
      where: { id },
      relations: ['matricula.aluno'],
    });
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

    // CORREÇÃO DO ERRO 'possibly null':
    if (!fullMat) {
      throw new NotFoundException('Matrícula não encontrada para este termo');
    }

    return {
      alunoNome: fullMat.aluno.nome,
      cursoNome: fullMat.curso?.nome || 'Curso',
      todosOsTermos: fullMat.termos.map((t) => ({
        ...t,
        // Usamos o '?' aqui também por segurança
        aulasRealizadas:
          t.aulas?.filter((a) => a.status === 'Presente').length || 0,
      })),
    };
  }
}
