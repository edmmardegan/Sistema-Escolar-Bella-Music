// src/agenda/agenda.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aula } from '../entities/aula.entity';
import { Matricula } from '../entities/matricula.entity';
import { MatriculaTermo } from '../entities/matricula-termo.entity';
import { Raw, ILike } from 'typeorm'; // Adicione ILike nas importações
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

  async findAll(
    tipo: string,
    data?: string,
    dataFim?: string,
    nome?: string,
  ): Promise<Aula[]> {
    const hoje = new Date().toISOString().split('T')[0];

    const query = this.repository
      .createQueryBuilder('aula')
      .leftJoinAndSelect('aula.termo', 'termo')
      .leftJoinAndSelect('termo.matricula', 'matricula')
      .leftJoinAndSelect('matricula.aluno', 'aluno')
      .leftJoinAndSelect('matricula.curso', 'curso');

    if (tipo === 'dia') {
      query.where('CAST(aula.data AS DATE) = :data', { data: data || hoje });
    } else if (tipo === 'pendentes') {
      query
        .where('aula.status = :status', { status: 'Pendente' })
        .andWhere('aula.data < :hoje', { hoje: new Date() });
    } else if (tipo === 'reposicoes') {
      query.where('aula.status = :status', { status: 'Falta' });
    } else if (tipo === 'historico') {
      if (data && dataFim) {
        query.where('CAST(aula.data AS DATE) BETWEEN :inicio AND :fim', {
          inicio: data,
          fim: dataFim,
        });
      } else {
        query.where('CAST(aula.data AS DATE) = :data', { data: data || hoje });
      }
    }

    if (nome && nome.trim() !== '') {
      query.andWhere('LOWER(aluno.nome) LIKE LOWER(:nome)', {
        nome: `%${nome}%`,
      });
    }

    query
      .orderBy('aula.data', tipo === 'historico' ? 'DESC' : 'ASC')
      .addOrderBy('aluno.nome', 'ASC');

    return await query.getMany();
  }

  async remove(id: number): Promise<{ success: boolean }> {
    const aula = await this.repository.findOne({ where: { id } });
    if (!aula) throw new NotFoundException('Aula não encontrada');
    if (aula.status !== 'Pendente')
      throw new Error('Apenas aulas pendentes podem ser excluídas');

    await this.repository.delete(id);
    return { success: true };
  }

  async registrarFrequencia(
    id: number,
    acao: 'presenca' | 'falta' | 'reposicao',
    motivo?: string,
  ): Promise<any> {
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

  /*
  // NOME AJUSTADO PARA MINÚSCULO E TIPADO
  async gerarMensal(mes: number, ano: number): Promise<{ message: string }> {
    console.log('Passei aqui click'); // Adicione esse log para testar
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
              where: { termo: { id: termo.id }, data: dataCursor },
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
            if (mat.frequencia === 'Quinzenal') podeGerarEstaSemana = false;
          } else if (mat.frequencia === 'Quinzenal' && !podeGerarEstaSemana) {
            podeGerarEstaSemana = true;
          }
        }
        dataCursor.setDate(dataCursor.getDate() + 1);
      }
    }
    return { message: `Sucesso! Foram geradas ${totalCriado} novas aulas.` };
  }*/

  // NOME AJUSTADO PARA MINÚSCULO E TIPADO
  async gerarMensal(mes: number, ano: number): Promise<{ message: string }> {
    console.log(`--- INICIANDO GERAÇÃO: Mês ${mes + 1} Ano ${ano} ---`);

    const matriculas = await this.matriculaRepo.find({
      where: { situacao: ILike('Em andamento') },
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
      const termo = await this.termoRepo.findOne({
        where: {
          matricula: { id: mat.id },
          numeroTermo: mat.termo_atual,
        },
      });

      if (!termo || diaSemanaDesejado === undefined) continue;

      const mesBase = mes;
      const dataCursor = new Date(ano, mesBase, 1, 12, 0, 0);

      while (dataCursor.getMonth() === mesBase) {
        if (dataCursor.getDay() === diaSemanaDesejado) {
          // Formata a data atual para YYYY-MM-DD
          const dataIso = dataCursor.toISOString().split('T')[0];

          // --- TRAVA DE DUPLICIDADE PARA TIMESTAMP ---
          const existe = await this.repository.findOne({
            where: {
              termo: { id: termo.id },
              // O Raw converte o timestamp do banco para Date apenas na comparação
              data: Raw((alias) => `CAST(${alias} AS DATE) = :data`, {
                data: dataIso,
              }),
            },
          });

          if (!existe) {
            const [hora, minuto] = mat.horario.split(':');
            const dataFinal = new Date(dataCursor);
            dataFinal.setHours(parseInt(hora), parseInt(minuto), 0, 0);

            await this.repository.save({
              termo: termo,
              data: dataFinal,
              status: 'Pendente',
            });
            totalCriado++;
          }
        }
        dataCursor.setDate(dataCursor.getDate() + 1);
      }
    }

    return { message: `Sucesso! Foram geradas ${totalCriado} novas aulas.` };
  }
}
