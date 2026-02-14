import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, Like } from 'typeorm';
import { Matricula } from '../entities/matricula.entity';
import { MatriculaTermo } from '../entities/matricula-termo.entity';
import { Aula } from '../entities/aula.entity';
import { CreateMatriculaDto } from './dto/create-matricula.dto';
import { UpdateTermoDto } from './dto/update-termo.dto';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { FinanceiroCalculoUtil } from '../financeiro/utils/financeiro-calculo.util';
import { Financeiro } from 'src/entities/financeiro.entity';

@Injectable()
export class MatriculaService {
  constructor(
    @InjectRepository(Matricula)
    private readonly repository: Repository<Matricula>,

    @InjectRepository(Financeiro)
    private readonly repositoryFinanceiro: Repository<Financeiro>,

    @InjectRepository(MatriculaTermo)
    private readonly termoRepo: Repository<MatriculaTermo>,
  ) {}

  async findAll(): Promise<Matricula[]> {
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

    // --- MODO EDIÇÃO ---
    if (data.id) {
      const id = data.id;
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

    // --- MODO CRIAÇÃO ---
    const nova = this.repository.create({
      ...data,
      dataTermino: dataTerminoLimpa,
    } as DeepPartial<Matricula>);

    const salvo = await this.repository.save(nova);

    // 1. Busca completa para ter acesso ao curso e aluno
    const matCompleta = await this.repository.findOne({
      where: { id: salvo.id },
      relations: ['curso', 'aluno'],
    });

    if (!matCompleta) return null;

    // 2. Automação de Termos e Aulas (Extraído para método privado abaixo)
    if (matCompleta.curso?.qtdeTermos) {
      await this.gerarTermosEAulas(matCompleta);
    }

    // 3. Automação Financeira (Gera parcelas para o ano de início)
    const anoInicio = new Date(matCompleta.dataInicio).getFullYear();
    await this.gerarParcelaIndividual(matCompleta.id, anoInicio);

    return matCompleta;
  }

  /*** Método auxiliar para não poluir o save com loops de aulas */
  private async gerarTermosEAulas(matricula: Matricula) {
    const dataAula = new Date(matricula.dataInicio);
    dataAula.setHours(12, 0, 0, 0);
    const intervalo = matricula.frequencia === 'Quinzenal' ? 14 : 7;

    for (let i = 1; i <= matricula.curso.qtdeTermos; i++) {
      const termo = await this.termoRepo.save({
        numeroTermo: i,
        matricula: matricula,
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

  async updateTermo(id: number, data: UpdateTermoDto) {
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

  // --- 1. ROTINA INDIVIDUAL (CORRIGIDA E BLINDADA) ---
  // --- 1. ROTINA INDIVIDUAL (TIPADA E BLINDADA) ---
  async gerarParcelaIndividual(
    matriculaId: number,
    ano: number,
  ): Promise<Financeiro[] | { message: string }> {
    // 🔍 Busca no repositório de Matricula (this.repository)
    const matricula = await this.repository.findOne({
      where: { id: matriculaId },
      relations: ['aluno'],
    });

    if (!matricula) {
      throw new NotFoundException('Matrícula não encontrada.');
    }
    // 1. Verifique se já existe QUALQUER taxa de matrícula para este ID
    const jaTemTaxa = await this.repositoryFinanceiro.findOne({
      where: {
        matricula: { id: matriculaId },
        descricao: Like('%Taxa de Matrícula%'),
      },
    });
    // 🛡️ Verifica duplicidade no Financeiro (this.repositoryFinanceiro)
    const jaTem = await this.repositoryFinanceiro.count({
      where: {
        matricula: { id: matriculaId },
        dataVencimento: Like(`${ano}%`),
      },
    });

    if (jaTem > 0) {
      return { message: 'Este aluno já possui parcelas para este ano.' };
    }

    // Definimos como Partial<Financeiro> para garantir segurança de tipos ao popular
    const novasParcelas: Partial<Financeiro>[] = [];

    // A. Taxa de Matrícula (Vence no dia da geração)
    if (Number(matricula.valorMatricula) > 0 && !jaTemTaxa) {
      // <-- Só entra se não existir
      novasParcelas.push({
        aluno: matricula.aluno,
        matricula: matricula,
        descricao: `Taxa de Matrícula - ${ano}`,
        dataVencimento: new Date().toISOString().split('T')[0],
        valorTotal: Number(matricula.valorMatricula),
        status: 'Aberta',
        tipo: 'Receita',
      });
    }

    // B. Mensalidades
    const dataRef = matricula.dataInicio
      ? new Date(matricula.dataInicio)
      : new Date();

    // Lógica: Se a matrícula é de anos anteriores, começa em Janeiro (1).
    // Se é do ano atual, começa a partir do mês de início.
    const mesInicio = dataRef.getFullYear() < ano ? 1 : dataRef.getMonth() + 1;

    for (let mes = mesInicio; mes <= 12; mes++) {
      const diaVencimentoBase = Number(matricula.diaVencimento || 10);

      novasParcelas.push({
        aluno: matricula.aluno,
        matricula: matricula,
        descricao: `Mensalidade ${String(mes).padStart(2, '0')}/${ano}`,
        // ✅ Utilizando o utilitário estático centralizado
        dataVencimento: FinanceiroCalculoUtil.ajustarDataVencimento(
          ano,
          mes,
          diaVencimentoBase,
        ),
        valorTotal:
          Number(matricula.valorMensalidade || 0) +
          Number(matricula.valorCombustivel || 0),
        status: 'Aberta',
        tipo: 'Receita',
      });
    }

    // O TypeORM reconhece o retorno como um array de Financeiro
    return await this.repositoryFinanceiro.save(novasParcelas);
  }
}
