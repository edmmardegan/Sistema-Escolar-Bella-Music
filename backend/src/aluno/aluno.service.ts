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
  ) {}

  async findAll() {
    return await this.repository.find({
      relations: ['matriculas', 'matriculas.curso'],
      order: { nome: 'ASC' },
    });
  }

  async save(dados: any, userName: string): Promise<Aluno> {
    try {
      let alunoAntigo: Aluno | null = null;
      const acao = dados.id ? 'UPDATE' : 'INSERT';
      let contexto = '';

      if (dados.id) {
        alunoAntigo = await this.repository.findOneBy({ id: dados.id });
        contexto = `Aluno: ${alunoAntigo?.nome || 'N/D'}`;
      } else {
        contexto = `Novo Aluno: ${dados.nome}`;
      }

      const alunoSalvo: Aluno = await this.repository.save(dados);

      // Função de limpeza para não repetir ID e Nome no JSON de alteração
      const filtrarCampos = (antes: any, depois: any) => {
        const objAntes: any = {};
        const objDepois: any = {};

        // Campos que não queremos mostrar ID e Nome (já estão no contexto)
        const ignorarIdentificadores = [
          'id',
          'nome',
          'criadoEm',
          'atualizadoEm',
        ];
        // Campos que queremos registrar a mudança, mas esconder o valor real
        const mascarar = ['cpf'];

        Object.keys(depois).forEach((key) => {
          if (ignorarIdentificadores.includes(key)) return;

          if (JSON.stringify(antes[key]) !== JSON.stringify(depois[key])) {
            if (mascarar.includes(key)) {
              // 🔒 Se o CPF mudou, registramos o fato, mas escondemos o número
              objAntes[key] = '*** CPF ANTERIOR ***';
              objDepois[key] = '*** CPF ALTERADO ***';
            } else {
              // Para os demais campos, registra o valor normal (Telefone, Endereço, etc)
              objAntes[key] = antes[key];
              objDepois[key] = depois[key];
            }
          }
        });
        return { antes: objAntes, depois: objDepois };
      };

      const logs = { antes: alunoAntigo || {}, depois: dados };

      if (acao === 'UPDATE' && alunoAntigo) {
        const diff = filtrarCampos(alunoAntigo, dados);
        logs.antes = diff.antes;
        logs.depois = diff.depois;
      }

      // Só grava se houver mudança ou for inserção
      if (acao === 'INSERT' || Object.keys(logs.depois).length > 0) {
        await this.auditService.createLog(
          'aluno',
          acao,
          logs.antes,
          logs.depois,
          userName,
          contexto, // 👈 Identificação clara
        );
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

  async remove(id: number, userName: string = 'SISTEMA') {
    const registro = await this.repository.findOneBy({ id });
    if (!registro) throw new NotFoundException('Aluno não encontrado');

    const contexto = `Exclusão Aluno: ${registro.nome}`;
    const alunoRemovido = await this.repository.remove(registro);

    // Usando o service padronizado em vez do repo direto
    await this.auditService.createLog(
      'aluno',
      'DELETE',
      { nome: registro.nome },
      {},
      userName,
      contexto,
    );

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
    const alunoAntes = await this.repository.findOneBy({ id });
    if (!alunoAntes) throw new NotFoundException('Aluno não encontrado');

    const contexto = `Aluno: ${alunoAntes.nome}`;

    await this.repository.update(id, updateDto);

    await this.auditService.createLog(
      'aluno',
      'UPDATE',
      alunoAntes, // O service de auditoria já faz o diff
      updateDto,
      userName,
      contexto,
    );

    return { message: 'Atualizado com sucesso' };
  }
}
