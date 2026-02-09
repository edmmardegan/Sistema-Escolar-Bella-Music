import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Raw, Between } from 'typeorm'; // Adicionado Between
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

  // PADRÃO: Listar (Read) - Atualizado para suportar Período e Nome
  async findAll(tipo: string, data?: string, dataFim?: string, nome?: string) {
    const hoje = new Date().toISOString().split('T')[0];

    // 1. Iniciamos a consulta trazendo todas as tabelas relacionadas (Joins)
    const query = this.repository
      .createQueryBuilder('aula')
      .leftJoinAndSelect('aula.termo', 'termo')
      .leftJoinAndSelect('termo.matricula', 'matricula')
      .leftJoinAndSelect('matricula.aluno', 'aluno')
      .leftJoinAndSelect('matricula.curso', 'curso');

    // 2. Filtros por Aba (Tipo)
    if (tipo === 'dia') {
      // Busca apenas um dia específico (ou hoje)
      query.where('CAST(aula.data AS DATE) = :data', { data: data || hoje });
    } else if (tipo === 'pendentes') {
      // Aulas que passaram da data e ninguém deu presença/falta
      query
        .where('aula.status = :status', { status: 'Pendente' })
        .andWhere('aula.data < :hoje', { hoje: new Date() });
    } else if (tipo === 'reposicoes') {
      // Aulas marcadas como Falta que precisam de reposição
      query.where('aula.status = :status', { status: 'Falta' });
    } else if (tipo === 'historico') {
      // Filtro por período (Data Inicial até Data Final)
      if (data && dataFim) {
        query.where('CAST(aula.data AS DATE) BETWEEN :inicio AND :fim', {
          inicio: data,
          fim: dataFim,
        });
      } else {
        query.where('CAST(aula.data AS DATE) = :data', { data: data || hoje });
      }
    }

    // 3. Filtro Global por Nome (Se digitar algo na busca, filtra o resultado da aba)
    if (nome && nome.trim() !== '') {
      // Convertemos o campo do banco e o parâmetro para minúsculo
      query.andWhere('LOWER(aluno.nome) LIKE LOWER(:nome)', {
        nome: `%${nome}%`,
      });
    }
    // 4. Ordenação (Onde a mágica da organização visual acontece)
    // Primeiro ordena por data (mais recente primeiro no histórico)
    // Dentro da mesma data, ordena os alunos de A a Z
    query
      .orderBy('aula.data', tipo === 'historico' ? 'DESC' : 'ASC')
      .addOrderBy('aluno.nome', 'ASC');

    // 5. Executa a busca no banco de dados
    return await query.getMany();
  }

  // ... (restante dos métodos: remove, registrarFrequencia, gerarCicloMensal permanecem iguais)

  async remove(id: number) {
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

  async gerarCicloMensal(mes: number, ano: number) {
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
  }
}
