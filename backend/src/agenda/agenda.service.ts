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
    private readonly aulaRepo: Repository<Aula>,

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

    const query = this.aulaRepo
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
    const aula = await this.aulaRepo.findOne({ where: { id } });
    if (!aula) throw new NotFoundException('Aula não encontrada');

    // 1. BANCO: Apenas a aula (1 argumento)
    await this.aulaRepo.remove(aula);

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
    const aulaAntes = await this.aulaRepo.findOne({
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
    await this.aulaRepo.update(id, novosDados);

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
    // 1. Busca matrículas ativas
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
      if (diaSemanaDesejado === undefined) continue;

      // --- 🛡️ LOGICA DE RECUPERAÇÃO/CRIAÇÃO DO TERMO ---
      let termo = await this.termoRepo.findOne({
        where: {
          matricula: { id: mat.id },
          numeroTermo: mat.termo_atual,
        },
      });

      // Se o termo não existe (comum após importação), criamos ele agora!
      if (!termo) {
        termo = await this.termoRepo.save({
          matricula: mat,
          numeroTermo: mat.termo_atual,
          status: 'Em andamento',
          // adicione outros campos obrigatórios do seu MatriculaTermo aqui se houver
        });
      }

      // Cursor de datas (Meio-dia para evitar bugs de fuso horário)
      const dataCursor = new Date(ano, mes, 1, 12, 0, 0);
      let contadorSemanasNoMes = 0;

      while (dataCursor.getMonth() === mes) {
        if (dataCursor.getDay() === diaSemanaDesejado) {
          contadorSemanasNoMes++;

          // Respeita a Frequência (Semanal vs Quinzenal)
          const ehSemanaValida =
            mat.frequencia === 'Quinzenal'
              ? contadorSemanasNoMes === 1 || contadorSemanasNoMes === 3
              : true;

          if (ehSemanaValida) {
            const dataIso = dataCursor.toISOString().split('T')[0];

            // Verifica se a aula já existe para evitar duplicidade
            const existe = await this.aulaRepo.findOne({
              where: {
                termo: { id: termo.id },
                data: Raw((alias) => `CAST(${alias} AS DATE) = :data`, {
                  data: dataIso,
                }),
              },
            });

            if (!existe) {
              const [hora, minuto] = mat.horario.split(':');
              const dataFinal = new Date(
                ano,
                mes,
                dataCursor.getDate(),
                parseInt(hora),
                parseInt(minuto),
                0,
              );

              await this.aulaRepo.save({
                termo: termo,
                data: dataFinal,
                status: 'Pendente',
              });
              totalCriado++;
            }
          }
        }
        dataCursor.setDate(dataCursor.getDate() + 1);
      }
    }

    // Auditoria
    await this.auditService.createLog(
      'agenda',
      'INSERT',
      {},
      {
        operacao: 'Geração Mensal',
        mes: mes + 1,
        ano,
        totalAulas: totalCriado,
      },
      userName,
    );

    return { message: `Sucesso! Foram geradas ${totalCriado} novas aulas.` };
  }
}
