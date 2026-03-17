import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Curso } from '../entities/curso.entity';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CursoService {
  constructor(
    @InjectRepository(Curso)
    private readonly repository: Repository<Curso>,
    private readonly auditService: AuditService,
  ) {}

  async findAll() {
    return await this.repository.find({ order: { nome: 'ASC' } });
  }

  async save(
    dados: (CreateCursoDto | UpdateCursoDto) & { id?: number },
    userName: string,
  ): Promise<Curso> {
    try {
      let cursoAntigo: Curso | null = null;
      const acao = dados.id ? 'UPDATE' : 'INSERT';
      let contexto = '';

      if (dados.id) {
        cursoAntigo = await this.repository.findOneBy({ id: dados.id });
        contexto = `Curso: ${cursoAntigo?.nome || 'N/D'}`;
      } else {
        contexto = `Novo Curso: ${dados.nome}`;
      }

      const cursoSalvo: Curso = await this.repository.save(dados);

      // ✅ FUNÇÃO PARA FILTRAR APENAS AS MUDANÇAS REAIS
      const filtrarAlteracoes = (antes: any, depois: any) => {
        const objAntes: any = {};
        const objDepois: any = {};

        // Campos que não queremos no JSON de alteração (ID e Nome já estão no contexto)
        const ignorar = ['id', 'nome', 'atualizadoEm', 'criadoEm'];

        Object.keys(depois).forEach((key) => {
          if (ignorar.includes(key)) return;

          // Compara os valores (convertendo para String para garantir a comparação correta)
          if (antes[key] !== depois[key]) {
            objAntes[key] = antes[key];
            objDepois[key] = depois[key];
          }
        });

        return { antes: objAntes, depois: objDepois };
      };

      const logsParaGravar = { antes: cursoAntigo || {}, depois: dados };

      // Se for UPDATE, limpamos a redundância
      if (acao === 'UPDATE' && cursoAntigo) {
        const diff = filtrarAlteracoes(cursoAntigo, dados);
        logsParaGravar.antes = diff.antes;
        logsParaGravar.depois = diff.depois;
      }

      // Só grava o log se houver mudança real ou se for um INSERT
      if (acao === 'INSERT' || Object.keys(logsParaGravar.depois).length > 0) {
        await this.auditService.createLog(
          'curso',
          acao,
          logsParaGravar.antes,
          logsParaGravar.depois,
          userName,
          contexto,
        );
      }

      return cursoSalvo;
    } catch (error) {
      console.error('Erro ao salvar curso:', error);
      throw new InternalServerErrorException(
        'Erro ao salvar os dados do curso.',
      );
    }
  }

  async remove(id: number, userName: string) {
    const registro = await this.repository.findOneBy({ id });
    if (!registro) throw new NotFoundException('Curso não encontrado');

    const contexto = `Exclusão Curso: ${registro.nome}`;

    const cursoRemovido = await this.repository.remove(registro);

    await this.auditService.createLog(
      'curso',
      'DELETE',
      registro,
      {},
      userName,
      contexto, // 👈 IDENTIFICAÇÃO NO DELETE
    );

    return cursoRemovido;
  }
}
