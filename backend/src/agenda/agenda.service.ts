// src/agenda/agenda.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aula } from '../entities/aula.entity';
import { Matricula } from '../entities/matricula.entity';
import { MatriculaTermo } from '../entities/matricula-termo.entity';
import { Raw, ILike } from 'typeorm';
import { AuditService } from '../audit/audit.service';
@Injectable()
export class AgendaService {
  constructor(
    @InjectRepository(Aula)
    private readonly repository: Repository<Aula>,

    @InjectRepository(Matricula)
    private readonly matriculaRepo: Repository<Matricula>,

    @InjectRepository(MatriculaTermo)
    private readonly termoRepo: Repository<MatriculaTermo>,

    private readonly auditService: AuditService,
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

  async remove(id: number, userName: string): Promise<{ success: boolean }> {
    const aula = await this.repository.findOne({ where: { id } });
    if (!aula) throw new NotFoundException('Aula não encontrada');

    // 1. BANCO: Apenas a aula (1 argumento)
    await this.repository.remove(aula);

    // 2. AUDITORIA: Aqui sim você usa o userName (5 argumentos)
    await this.auditService.createLog('aula', 'DELETE', aula, {}, userName);

    return { success: true };
  }

  async registrarFrequencia(
    id: number,
    acao: 'presenca' | 'falta' | 'reposicao',
    motivo: string | undefined,
    userName: string,
  ): Promise<any> {
    // 1. O SEGREDO ESTÁ AQUI: Carregar as relações para o log saber de quem é a aula
    const aulaAntes = await this.repository.findOne({
      where: { id },
      relations: [
        'termo',
        'termo.matricula',
        'termo.matricula.aluno',
        'termo.matricula.curso',
      ],
    });

    if (!aulaAntes) throw new NotFoundException('Aula não encontrada');

    // 2. Montamos um objeto com as informações fixas da aula para o log
    const infoAula = {
      aluno: aulaAntes.termo?.matricula?.aluno?.nome || 'Não encontrado',
      curso: aulaAntes.termo?.matricula?.curso?.nome || 'Não encontrado',
      dataAula: aulaAntes.data,
      horario: aulaAntes.termo?.matricula?.horario || 'N/D',
    };

    let novosDados: any = {};

    if (acao === 'presenca') {
      novosDados = {
        status: 'Presente',
        motivoFalta: null,
      };
    } else if (acao === 'falta') {
      novosDados = {
        status: 'Falta',
        motivoFalta: motivo,
      };
    } else if (acao === 'reposicao') {
      const dataHoje = new Date().toLocaleDateString('pt-BR');
      novosDados = {
        status: 'Presente',
        obs:
          (aulaAntes.obs ? `${aulaAntes.obs} | ` : '') +
          `Reposição realizada em ${dataHoje}`,
      };
    }

    // 3. Atualizamos o banco
    await this.repository.update(id, novosDados);

    // 4. AUDITORIA: Montagem manual para não ter erro
    const logAnterior = {
      aluno: aulaAntes.termo?.matricula?.aluno?.nome || 'Nome não carregado',
      curso: aulaAntes.termo?.matricula?.curso?.nome || 'Curso não carregado',
      dataAula: aulaAntes.data,
      status: aulaAntes.status,
    };

    const logNovo = {
      aluno: aulaAntes.termo?.matricula?.aluno?.nome || 'Nome não carregado',
      curso: aulaAntes.termo?.matricula?.curso?.nome || 'Curso não carregado',
      dataAula: aulaAntes.data,
      status: novosDados.status,
      motivo: novosDados.motivoFalta || null,
    };

    await this.auditService.createLog(
      'aula',
      'UPDATE',
      logAnterior,
      logNovo,
      userName,
    );
  }

  async gerarMensal(
    mes: number,
    ano: number,
    userName: string,
  ): Promise<{ message: string }> {
    console.log(
      `--- INICIANDO GERAÇÃO: Mês ${mes + 1} Ano ${ano} por ${userName} ---`,
    );

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
          const dataIso = dataCursor.toISOString().split('T')[0];

          const existe = await this.repository.findOne({
            where: {
              termo: { id: termo.id },
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

    // 🛡️ ADICIONE O LOG DE AUDITORIA AQUI ANTES DO RETURN
    await this.auditService.createLog(
      'agenda',
      'INSERT',
      {},
      {
        operacao: 'Geração Mensal de Aulas',
        mes: mes + 1,
        ano,
        totalAulas: totalCriado,
      },
      userName,
    );

    return { message: `Sucesso! Foram geradas ${totalCriado} novas aulas.` };
  }
}
