// Local: src/aluno/aluno.service.ts

import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aluno } from '../entities/aluno.entity';
import { AuditLog } from '../entities/auditLog'; // Importe a entidade de Log
import { AuditService } from '../audit/audit.service';
import { UpdateAlunoDto } from './dto/update-aluno.dto';
@Injectable()
export class AlunoService {
  constructor(
    @InjectRepository(Aluno)
    private readonly repository: Repository<Aluno>,

    private readonly auditService: AuditService,

    @InjectRepository(AuditLog) // Injetando o repositório de log diretamente
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async findAll() {
    return await this.repository.find({
      relations: ['matriculas', 'matriculas.curso'],
      order: { nome: 'ASC' },
    });
  }

  async save(dados: any, userName: string): Promise<Aluno> {
    try {
      // 1. Inicializamos a variável fora dos blocos para ela ser "enxergada" depois
      let alunoAntigo: Aluno | null = null;
      const acao = dados.id ? 'UPDATE' : 'INSERT';

      // 2. Se for uma edição, buscamos o estado atual ANTES de salvar
      if (dados.id) {
        alunoAntigo = await this.repository.findOneBy({ id: dados.id });
      }
      // 3. Salva no banco (O TypeORM retorna o objeto salvo do tipo Aluno)
      const alunoSalvo: Aluno = await this.repository.save(dados);
      // 4. CHAMA A MÁQUINA DE LAVAR (AuditService)
      // Usamos 'dados' (o que veio da rota) para comparar com 'alunoAntigo'
      await this.auditService.createLog(
        'aluno',
        acao,
        alunoAntigo || {},
        dados,
        userName,
      );

      // 5. Retornamos o objeto tipado corretamente
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

  async update(id: number, updateDto: UpdateAlunoDto, userName: string) {
    // 1. Você BUSCA o aluno como ele está AGORA no banco (antes de mudar)
    const alunoAntes = await this.repository.findOneBy({ id });
    // 2. Você executa o update
    await this.repository.update(id, updateDto);
    // 3. VOCÊ PASSA O 'updateDto' (que só tem o que veio do form) para o createLog
    // Se você passar o objeto 'aluno' completo aqui, o filtro vai falhar!
    await this.auditService.createLog(
      'aluno',
      'UPDATE',
      alunoAntes, // O que era
      updateDto, // O que o usuário enviou (DADOS NOVOS)
      userName,
    );

    return { message: 'Atualizado com sucesso' };
  }
}
