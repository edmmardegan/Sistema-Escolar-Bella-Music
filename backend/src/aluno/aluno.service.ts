import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aluno } from '../entities/aluno.entity';
import { AuditLog } from '../entities/auditLog'; // Importe a entidade de Log
import { CreateAlunoDto } from './dto/create-aluno.dto';

@Injectable()
export class AlunoService {
  constructor(
    @InjectRepository(Aluno)
    private readonly repository: Repository<Aluno>,

    @InjectRepository(AuditLog) // Injetando o repositório de log diretamente
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async findAll() {
    return await this.repository.find({
      relations: ['matriculas', 'matriculas.curso'],
      order: { nome: 'ASC' },
    });
  }

  async save(dados: CreateAlunoDto & { id?: number }) {
    try {
      let alunoAntigo = null;
      let acao: 'INSERT' | 'UPDATE' = 'INSERT';

      // Se tiver ID, busca o estado atual para o log
      if (dados.id) {
        alunoAntigo = await this.repository.findOneBy({ id: dados.id });
        acao = 'UPDATE';
      }

      // Salva o aluno
      const alunoSalvo = await this.repository.save(dados);

      // --- GERAÇÃO MANUAL DO LOG DE AUDITORIA ---
      try {
        await this.auditRepo.save({
          table_name: 'aluno',
          action: acao,
          old_values: alunoAntigo || {},
          new_values: alunoSalvo,
          user_name: 'SISTEMA_LOCAL', // Futuramente você pode pegar do Request
        });
        console.log(
          `✅ Log de ${acao} gravado para o aluno: ${alunoSalvo.nome}`,
        );
      } catch (logError) {
        // Se o log falhar, não paramos a execução principal, apenas avisamos no console
        console.error('⚠️ Erro ao gravar log de auditoria:', logError);
      }

      return alunoSalvo;
    } catch (error) {
      if (error.code === '23505') {
        throw new InternalServerErrorException('Este CPF já está cadastrado.');
      }
      throw new InternalServerErrorException(
        'Erro ao salvar os dados do aluno.',
      );
    }
  }

  async remove(id: number) {
    const registro = await this.repository.findOneBy({ id });
    if (!registro) throw new NotFoundException('Aluno não encontrado');

    const alunoRemovido = await this.repository.remove(registro);

    // Log de remoção
    await this.auditRepo
      .save({
        table_name: 'aluno',
        action: 'DELETE',
        old_values: registro,
        new_values: {},
        user_name: 'SISTEMA_LOCAL',
      })
      .catch((e) => console.error('Erro ao logar remoção:', e));

    return alunoRemovido;
  }

  async buscarAniversariantes() {
    try {
      const hoje = new Date();
      const mes = hoje.getMonth() + 1;
      const dia = hoje.getDate();

      return await this.repository
        .createQueryBuilder('aluno')
        .where('EXTRACT(MONTH FROM aluno.dataNascimento) = :mes', { mes })
        .andWhere('EXTRACT(DAY FROM aluno.dataNascimento) = :dia', { dia })
        .getMany();
    } catch (error) {
      throw new InternalServerErrorException('Erro ao buscar aniversariantes');
    }
  }
}
