// src/financeiro/financeiro.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Financeiro } from '../entities/financeiro.entity';
import { Matricula } from '../entities/matricula.entity';
import { GerarLoteDto } from './dto/gerar-lote.dto';
import { ReajusteAnualDto } from './dto/reajuste-anual.dto';
import { FinanceiroCalculoUtil } from './utils/financeiro-calculo.util';
import { AuditService } from 'src/audit/audit.service';

@Injectable()
export class FinanceiroService {
  constructor(
    @InjectRepository(Financeiro)
    private readonly repository: Repository<Financeiro>,

    @InjectRepository(Matricula)
    private readonly matriculaRepo: Repository<Matricula>,

    private readonly auditService: AuditService,
  ) {}

  async findAll() {
    console.log('--- CHAMANDO FINDALL FINANCEIRO ---');
    const dados = await this.repository.find({
      relations: ['aluno', 'matricula'], // Força o Join com as duas tabelas
      order: { dataVencimento: 'ASC' },
    });

    // Esse log vai aparecer no terminal onde o seu NestJS está rodando.
    // Se aqui aparecer o nome do aluno, o backend está corrigido!
    console.log('PRIMEIRO REGISTRO:', dados[0]);

    return dados;
  }

  async findByMatricula(matriculaId: number): Promise<Financeiro[]> {
    return this.repository.find({
      where: { matricula: { id: matriculaId } },
      relations: ['aluno', 'matricula'],
      order: { dataVencimento: 'ASC' },
    });
  }

  async atualizarStatus(
    id: number,
    status: 'Paga' | 'Aberta',
    userName: string = 'SISTEMA', // 👈 Adicione o userName
  ): Promise<Financeiro> {
    const parcelaAntes = await this.repository.findOne({
      where: { id },
      relations: ['aluno'], // Importante para o log saber de quem é
    });

    if (!parcelaAntes) throw new NotFoundException('Parcela não encontrada');

    // Criamos o objeto de log com contexto fixo
    const infoFixa = {
      aluno: parcelaAntes.aluno?.nome || 'N/D',
      descricao: parcelaAntes.descricao,
      vencimento: parcelaAntes.dataVencimento,
      valor: parcelaAntes.valorTotal,
    };

    parcelaAntes.status = status;
    const salva = await this.repository.save(parcelaAntes);

    await this.auditService.createLog(
      'financeiro',
      'UPDATE',
      { ...infoFixa, status: status === 'Paga' ? 'Aberta' : 'Paga' },
      { ...infoFixa, status: status },
      userName,
    );

    return salva;
  }

  // --- AJUSTE NA GERAÇÃO DE LOTE ---
  async gerarParcelaGlobal(
    dto: GerarLoteDto,
    userName: string = 'SISTEMA', // 1. Adicionamos o userName aqui
  ): Promise<{ gerados: number; totalParcelas: number }> {
    const { mes: mesInicio, ano } = dto;

    const matriculas = await this.matriculaRepo.find({
      where: { situacao: 'Em Andamento' },
      relations: ['aluno'],
    });

    const parcelasExistentes = await this.repository
      .createQueryBuilder('f')
      .select('f.matriculaId', 'matriculaId')
      .where('f.dataVencimento >= :inicio AND f.dataVencimento <= :fim', {
        inicio: `${ano}-01-01`,
        fim: `${ano}-12-31`,
      })
      .getRawMany<{ matriculaId: number }>();

    const idsComParcela = new Set(parcelasExistentes.map((p) => p.matriculaId));
    const todasAsNovasParcelas: Partial<Financeiro>[] = [];
    let totalGerado = 0;

    for (const mat of matriculas) {
      if (idsComParcela.has(mat.id)) continue;

      for (let mes = mesInicio; mes <= 12; mes++) {
        const diaBase = Number(mat.diaVencimento || 10);

        todasAsNovasParcelas.push({
          matricula: mat,
          aluno: mat.aluno,
          descricao: `Mensalidade ${String(mes).padStart(2, '0')}/${ano} (Lote)`,
          dataVencimento: FinanceiroCalculoUtil.ajustarDataVencimento(
            ano,
            mes,
            diaBase,
          ),
          valorTotal:
            Number(mat.valorMensalidade || 0) +
            Number(mat.valorCombustivel || 0),
          status: 'Aberta',
          tipo: 'Receita',
        });
      }
      totalGerado++;
    }

    if (todasAsNovasParcelas.length > 0) {
      await this.repository.save(todasAsNovasParcelas as Financeiro[], {
        chunk: 500,
      });

      // 2. AUDITORIA: Registramos apenas UM log com o resumo da operação
      await this.auditService.createLog(
        'financeiro',
        'INSERT',
        {}, // ANTERIOR: Nada (vazio)
        {
          operacao: 'Geração Global de Parcelas',
          anoRef: ano,
          mesInicio: mesInicio,
          totalAlunosProcessados: totalGerado,
          totalParcelasCriadas: todasAsNovasParcelas.length,
        }, // NOVO: Resumo do que aconteceu
        userName,
      );
    }

    return { gerados: totalGerado, totalParcelas: todasAsNovasParcelas.length };
  }

  // --- AJUSTE NO REMOVE ---
  async remove(id: number, userName: string = 'SISTEMA'): Promise<any> {
    const parcela = await this.repository.findOne({
      where: { id },
      relations: ['aluno'],
    });
    if (!parcela) throw new NotFoundException('Parcela não encontrada');

    await this.auditService.createLog(
      'financeiro',
      'DELETE',
      {
        aluno: parcela.aluno?.nome,
        descricao: parcela.descricao,
        valor: parcela.valorTotal,
      },
      {},
      userName,
    );

    return await this.repository.delete(id);
  }

  // --- 2. REAJUSTE ANUAL (OTIMIZADO) ---
  async aplicarReajusteAnual(dto: ReajusteAnualDto): Promise<any> {
    const { ano, aumento: valorAumento } = dto;

    const matriculas = await this.matriculaRepo.find({
      where: { situacao: 'Em Andamento' },
    });

    let matriculasAtualizadas = 0;
    let parcelasAtualizadas = 0;

    for (const mat of matriculas) {
      mat.valorMensalidade = Number(mat.valorMensalidade || 0) + valorAumento;
      await this.matriculaRepo.save(mat);
      matriculasAtualizadas++;

      const parcelasParaReajustar = await this.repository.find({
        where: {
          matricula: { id: mat.id },
          status: 'Aberta',
          dataVencimento: MoreThanOrEqual(`${ano}-01-01`),
        },
      });

      for (const parcela of parcelasParaReajustar) {
        parcela.valorTotal = Number(parcela.valorTotal || 0) + valorAumento;
        await this.repository.save(parcela);
        parcelasAtualizadas++;
      }
    }

    return {
      message: 'Reajuste aplicado com sucesso',
      matriculas: matriculasAtualizadas,
      parcelas: parcelasAtualizadas,
    };
  }
}
