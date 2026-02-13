// src/financeiro/financeiro.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThanOrEqual } from 'typeorm';
import { Financeiro } from '../entities/financeiro.entity';
import { Matricula } from '../entities/matricula.entity';
import { GerarLoteDto } from './dto/gerar-lote.dto';
import { ReajusteAnualDto } from './dto/reajuste-anual.dto';

@Injectable()
export class FinanceiroService {
  constructor(
    @InjectRepository(Financeiro)
    private readonly repository: Repository<Financeiro>,
    @InjectRepository(Matricula)
    private readonly matriculaRepo: Repository<Matricula>,
  ) {}

  async findAll() {
    return await this.repository.find({
      relations: ['matricula', 'aluno', 'matricula.aluno'],
      order: { dataVencimento: 'ASC' },
    });
  }

  async atualizarStatus(id: number, status: 'Paga' | 'Aberta') {
    const parcela = await this.repository.findOne({ where: { id } });
    if (!parcela) throw new NotFoundException('Parcela não encontrada');
    parcela.status = status;
    return await this.repository.save(parcela);
  }

  async remove(id: number) {
    return await this.repository.delete(id);
  }

  // Recebe o objeto validado pelo DTO
  async gerarCicloGlobal(dto: GerarLoteDto) {
    const { mes: mesInicio, ano } = dto;

    const matriculas = await this.matriculaRepo.find({
      where: { situacao: 'Em Andamento' },
      relations: ['aluno'],
    });

    let totalGerado = 0;
    for (const mat of matriculas) {
      const existe = await this.repository.count({
        where: { matricula: { id: mat.id }, dataVencimento: Like(`${ano}%`) },
      });

      if (existe > 0) continue;

      const novas: any[] = [];
      // OU (Mais profissional):
      //const novas: Partial<Financeiro>[] = [];

      for (let mes = mesInicio; mes <= 12; mes++) {
        const mesStr = String(mes).padStart(2, '0');
        const dataVenc = `${ano}-${mesStr}-${String(mat.diaVencimento || 10).padStart(2, '0')}T12:00:00`;

        novas.push({
          aluno: mat.aluno,
          matricula: mat,
          descricao: `Mensalidade ${mesStr}/${ano} (Lote)`,
          dataVencimento: dataVenc,
          valorTotal:
            Number(mat.valorMensalidade || 0) +
            Number(mat.valorCombustivel || 0),
          status: 'Aberta',
          tipo: 'Receita',
        });
      }

      if (novas.length > 0) {
        await this.repository.save(novas);
        totalGerado++;
      }
    }
    return { gerados: totalGerado };
  }

  // Recebe o objeto validado pelo DTO
  async aplicarReajusteAnual(dto: ReajusteAnualDto) {
    const { ano, aumento: valorAumento } = dto;

    const matriculas = await this.matriculaRepo.find({
      where: { situacao: 'Em Andamento' },
    });

    let matriculasAtualizadas = 0;
    let parcelasAtualizadas = 0;

    for (const mat of matriculas) {
      mat.valorMensalidade = Number(mat.valorMensalidade) + valorAumento;
      await this.matriculaRepo.save(mat);
      matriculasAtualizadas++;

      const parcelasParaReajustar = await this.repository.find({
        where: {
          matricula: { id: mat.id },
          status: 'Aberta',
          dataVencimento: MoreThanOrEqual(`${ano}-05-01`),
        },
      });

      for (const parcela of parcelasParaReajustar) {
        parcela.valorTotal = Number(parcela.valorTotal) + valorAumento;
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
