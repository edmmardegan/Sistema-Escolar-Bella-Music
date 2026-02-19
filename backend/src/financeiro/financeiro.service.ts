// src/financeiro/financeiro.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Financeiro } from '../entities/financeiro.entity';
import { Matricula } from '../entities/matricula.entity';
import { GerarLoteDto } from './dto/gerar-lote.dto';
import { ReajusteAnualDto } from './dto/reajuste-anual.dto';
import { FinanceiroCalculoUtil } from './utils/financeiro-calculo.util';

@Injectable()
export class FinanceiroService {
  constructor(
    @InjectRepository(Financeiro)
    private readonly repository: Repository<Financeiro>,
    @InjectRepository(Matricula)
    private readonly matriculaRepo: Repository<Matricula>,
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
  ): Promise<Financeiro> {
    const parcela = await this.repository.findOne({ where: { id } });
    if (!parcela) throw new NotFoundException('Parcela não encontrada');
    parcela.status = status;
    return await this.repository.save(parcela);
  }

  async remove(id: number): Promise<any> {
    return await this.repository.delete(id);
  }

  // --- 1. ROTINA GLOBAL (OTIMIZADA) ---
  async gerarParcelaGlobal(
    dto: GerarLoteDto,
  ): Promise<{ gerados: number; totalParcelas: number }> {
    const { mes: mesInicio, ano } = dto;

    const matriculas = await this.matriculaRepo.find({
      where: { situacao: 'Em Andamento' },
      relations: ['aluno'], // Precisamos do aluno para vincular à parcela se sua entidade exigir
    });

    const parcelasExistentes = await this.repository
      .createQueryBuilder('f')
      .select('f.matriculaId', 'matriculaId')
      // Ajustado para buscar no ano correto de forma mais segura
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
          aluno: mat.aluno, // Verifique se sua Entity Financeiro realmente tem esse campo
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
    }

    return { gerados: totalGerado, totalParcelas: todasAsNovasParcelas.length };
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
