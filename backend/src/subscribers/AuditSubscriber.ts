import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  UpdateEvent,
} from 'typeorm';
import { AuditLog } from '../entities/auditLog';

@Injectable()
@EventSubscriber()
export class AuditSubscriber
  implements EntitySubscriberInterface, OnModuleInit
{
  // O Nest injeta o dataSource aqui automaticamente
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  onModuleInit() {
    // Registra a si mesmo na conexão
    this.dataSource.subscribers.push(this);
    console.log('🚀 [Subscriber] Vinculado com sucesso ao DataSource!');
  }

  listenTo() {
    return 'all';
  }

  async afterUpdate(event: UpdateEvent<any>) {
    if (event.metadata.tableName === 'audit_logs') return;

    console.log(`🔥 [AUDIT] Detectado update em: ${event.metadata.tableName}`);

    const repo = event.manager.getRepository(AuditLog);
    await repo
      .save({
        table_name: event.metadata.tableName,
        action: 'UPDATE',
        old_values: event.databaseEntity,
        new_values: event.entity,
        user_name: 'SISTEMA',
      })
      .catch((e) => console.error('Erro ao gravar log:', e));
  }
}
