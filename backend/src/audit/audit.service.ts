//Local: /src/audit/audit.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between, FindOptionsWhere } from 'typeorm';
import { AuditLog } from '../entities/auditLog';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  // Definimos que o retorno é uma Promise de uma Array de AuditLog
  async findAll(filtros?: any): Promise<AuditLog[]> {
    try {
      // 1. Captura o limite vindo do Frontend. Se não vier, usa 20 como padrão.
      const { busca, dataInicio, dataFim, operacao, limite } = filtros || {};

      // Convertemos para número para o TypeORM não reclamar
      const takeValue = limite ? Number(limite) : 20;

      const condicoes: FindOptionsWhere<AuditLog> = {};

      if (dataInicio && dataFim && dataInicio !== '' && dataFim !== '') {
        condicoes.created_at = Between(
          new Date(`${dataInicio}T00:00:00`),
          new Date(`${dataFim}T23:59:59`),
        );
      }

      if (operacao && operacao !== '') {
        condicoes.action = operacao;
      }

      let whereClause:
        | FindOptionsWhere<AuditLog>
        | FindOptionsWhere<AuditLog>[];

      if (busca) {
        whereClause = [
          { ...condicoes, user_name: ILike(`%${busca}%`) },
          { ...condicoes, table_name: ILike(`%${busca}%`) },
        ];
      } else {
        whereClause = condicoes;
      }

      // 2. AQUI ESTÁ O SEGREDO: Usar a variável takeValue
      return await this.auditRepository.find({
        where: whereClause,
        order: { created_at: 'DESC' },
        take: takeValue, // 👈 Antes estava fixo, agora obedece o seu select
      });
    } catch (error) {
      console.error('Erro no Service de Auditoria:', error);
      throw new InternalServerErrorException('Erro ao filtrar logs');
    }
  }

  async createLog(
    table: string,
    action: string,
    oldV: any,
    newV: any,
    user: string,
  ): Promise<AuditLog> {
    try {
      const log = this.auditRepository.create({
        table_name: table,
        action,
        old_values: oldV,
        new_values: newV,
        user_name: user,
      });

      return await this.auditRepository.save(log);
    } catch (error) {
      console.error('Falha ao criar log:', error);
      throw new InternalServerErrorException('Falha ao gravar auditoria');
    }
  }
}
