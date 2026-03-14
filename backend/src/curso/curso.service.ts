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

    private readonly auditService: AuditService, // 👈 Injete o serviço de auditoria
  ) {}

  async findAll() {
    return await this.repository.find({ order: { nome: 'ASC' } });
  }

  // Adicionamos o userName como segundo parâmetro
  async save(
    dados: (CreateCursoDto | UpdateCursoDto) & { id?: number },
    userName: string,
  ): Promise<Curso> {
    try {
      let cursoAntigo: Curso | null = null;
      const acao = dados.id ? 'UPDATE' : 'INSERT';

      // 1. Se for UPDATE, busca como o curso era antes
      if (dados.id) {
        cursoAntigo = await this.repository.findOneBy({ id: dados.id });
      }
      // 2. Salva as alterações
      const cursoSalvo: Curso = await this.repository.save(dados);
      // 3. Chama a auditoria (a máquina de lavar vai filtrar os campos do curso)
      await this.auditService.createLog(
        'curso',
        acao,
        cursoAntigo || {},
        dados,
        userName,
      );

      return cursoSalvo;
    } catch (error) {
      console.error('Erro ao salvar curso:', error);
      throw new InternalServerErrorException(
        'Erro ao salvar os dados do curso.',
      );
    }
  }

  async remove(id: number, userName: string) {
    // 👈 Recebe userName para o log de delete
    const registro = await this.repository.findOneBy({ id });
    if (!registro) throw new NotFoundException('Curso não encontrado');

    const cursoRemovido = await this.repository.remove(registro);

    // Log de remoção usando o auditService para manter o padrão
    await this.auditService.createLog(
      'curso',
      'DELETE',
      registro,
      {},
      userName,
    );

    return cursoRemovido;
  }
}
