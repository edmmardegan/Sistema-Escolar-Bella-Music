// Local: src/agenda/agenda.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Raw } from 'typeorm';
import { Aula } from '../entities/aula.entity';
import { Matricula } from '../entities/matricula.entity';
import { MatriculaTermo } from '../entities/matricula-termo.entity';

@Injectable()
export class AgendaService {
  constructor(
    @InjectRepository(Aula)
    private readonly repository: Repository<Aula>,

    @InjectRepository(Matricula)
    private readonly matriculaRepo: Repository<Matricula>,

    @InjectRepository(MatriculaTermo)
    private readonly termoRepo: Repository<MatriculaTermo>,
  ) {}

  // PADRÃO: Listar (Read) - Adaptado para filtros de agenda
  async findAll(tipo: string, data?: string) {
    const hoje = new Date().toISOString().split('T')[0];

    switch (tipo) {
      case 'dia':
        return await this.repository
          .createQueryBuilder('aula')
          .leftJoinAndSelect('aula.termo', 'termo')
          .leftJoinAndSelect('termo.matricula', 'matricula')
          .leftJoinAndSelect('matricula.aluno', 'aluno')
          .leftJoinAndSelect('matricula.curso', 'curso')
          .where('CAST(aula.data AS DATE) = :data', { data: data || hoje })
          .orderBy('aula.data', 'ASC')
          .getMany();

      case 'pendentes':
        return await this.repository.find({
          where: {
            status: 'Pendente',
            data: LessThan(new Date(hoje + 'T00:00:00Z')),
          },
          relations: [
            'termo',
            'termo.matricula.aluno',
            'termo.matricula.curso',
          ],
          order: { data: 'DESC' },
        });

      case 'reposicoes':
        return await this.repository.find({
          where: { status: 'Falta' },
          relations: [
            'termo',
            'termo.matricula.aluno',
            'termo.matricula.curso',
          ],
          order: { data: 'ASC' },
        });

      case 'historico':
        return await this.repository
          .createQueryBuilder('aula')
          .leftJoinAndSelect('aula.termo', 'termo')
          .leftJoinAndSelect('termo.matricula', 'matricula')
          .leftJoinAndSelect('matricula.aluno', 'aluno')
          .leftJoinAndSelect('matricula.curso', 'curso')
          // Adicionamos o filtro de data aqui também!
          .where('CAST(aula.data AS DATE) = :data', { data: data || hoje })
          .orderBy('aula.data', 'ASC')
          .addOrderBy('aluno.nome', 'ASC')
          .getMany();

      default:
        return [];
    }
  }

  // PADRÃO: Remover (Delete)
  async remove(id: number) {
    const aula = await this.repository.findOne({ where: { id } });
    if (!aula) throw new NotFoundException('Aula não encontrada');
    if (aula.status !== 'Pendente')
      throw new Error('Apenas aulas pendentes podem ser excluídas');

    await this.repository.delete(id);
    return { success: true };
  }

  // MÉTODOS ESPECÍFICOS (Ações de frequência)
  async registrarFrequencia(
    id: number,
    acao: 'presenca' | 'falta' | 'reposicao',
    motivo?: string,
  ) {
    const aula = await this.repository.findOne({ where: { id } });
    if (!aula) throw new NotFoundException('Aula não encontrada');

    if (acao === 'presenca') {
      return this.repository.update(id, {
        status: 'Presente',
        motivoFalta: null,
      });
    } else if (acao === 'falta') {
      return this.repository.update(id, {
        status: 'Falta',
        motivoFalta: motivo,
      });
    } else if (acao === 'reposicao') {
      aula.status = 'Presente';
      const dataHoje = new Date().toLocaleDateString('pt-BR');
      aula.obs =
        (aula.obs ? `${aula.obs} | ` : '') +
        `Reposição realizada em ${dataHoje}`;
      return await this.repository.save(aula);
    }
  }

  // Lógica de Geração Mensal (Simplificada para o padrão)
  async gerarCicloMensal(mes: number, ano: number) {
    // Busca as matrículas com a nomenclatura existente
    const matriculas = await this.matriculaRepo.find({
      where: { situacao: 'Em Andamento' },
      relations: ['aluno', 'curso'],
    });

    let totalCriado = 0;

    const diasSemanaMap = {
      Segunda: 1,
      Terca: 2,
      Quarta: 3,
      Quinta: 4,
      Sexta: 5,
      Sabado: 6,
      Domingo: 0,
    };

    for (const mat of matriculas) {
      const diaSemanaDesejado = diasSemanaMap[mat.diaSemana];

      // Busca o termo atual conforme seu padrão
      const termo = await this.termoRepo.findOne({
        where: {
          matricula: { id: mat.id },
          numeroTermo: mat.termo_atual,
        },
      });

      if (!termo || diaSemanaDesejado === undefined) continue;

      const dataCursor = new Date(ano, mes, 1, 12, 0, 0);
      let podeGerarEstaSemana = true;

      while (dataCursor.getMonth() === mes) {
        if (dataCursor.getDay() === diaSemanaDesejado) {
          if (
            mat.frequencia === 'Semanal' ||
            (mat.frequencia === 'Quinzenal' && podeGerarEstaSemana)
          ) {
            const existe = await this.repository.findOne({
              where: {
                termo: { id: termo.id },
                data: dataCursor,
              },
            });

            if (!existe) {
              const [hora, minuto] = mat.horario.split(':');
              const dataFinal = new Date(dataCursor);
              dataFinal.setHours(parseInt(hora), parseInt(minuto), 0);

              await this.repository.save({
                termo: termo,
                data: dataFinal,
                status: 'Pendente',
                tipo: 'Regular',
              });
              totalCriado++;
            }

            if (mat.frequencia === 'Quinzenal') {
              podeGerarEstaSemana = false;
            }
          } else if (mat.frequencia === 'Quinzenal' && !podeGerarEstaSemana) {
            podeGerarEstaSemana = true;
          }
        }
        dataCursor.setDate(dataCursor.getDate() + 1);
      }
    }

    return { message: `Sucesso! Foram geradas ${totalCriado} novas aulas.` };
  }
}
