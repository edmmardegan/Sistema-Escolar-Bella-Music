//Local: /src/subscribers/AuditSubscriber.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { AuditLog } from '../entities/auditLog';
import { AlsService } from 'src/auth/als.service';

@Injectable()
@EventSubscriber()
export class AuditSubscriber
  implements EntitySubscriberInterface, OnModuleInit
{
  // Adicionando o 'private readonly' aqui, o TypeScript cria a propriedade automaticamente
  constructor(
    private readonly dataSource: DataSource,
    private readonly alsService: AlsService,
  ) {
    this.dataSource.subscribers.push(this);
  }

  onModuleInit() {
    // Registra a si mesmo na conexão se ainda não estiver lá
    if (!this.dataSource.subscribers.includes(this)) {
      this.dataSource.subscribers.push(this);
    }
  }

  listenTo() {
    return 'all';
  }

  async afterInsert(event: InsertEvent<any>) {
    if (event.metadata.tableName === 'audit_logs') return;
    const repo = event.manager.getRepository(AuditLog);
    const userReal = this.alsService.get('username') || 'SISTEMA';

    await repo.save({
      table_name: event.metadata.tableName,
      action: 'INSERT',
      old_values: null,
      new_values: event.entity,
      user_name: userReal, // 👈 AGORA SIM! Nome real vindo do JWT
      created_at: new Date(),
    });
  }

  async afterRemove(event: RemoveEvent<any>) {
    if (event.metadata.tableName === 'audit_logs') return;
    const repo = event.manager.getRepository(AuditLog);
    await repo.save({
      table_name: event.metadata.tableName,
      action: 'DELETE',
      old_values: event.entity || event.databaseEntity,
      new_values: null,
      user_name: 'SISTEMA',
    });
  }
}
