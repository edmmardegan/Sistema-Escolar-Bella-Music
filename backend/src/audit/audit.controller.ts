import { Controller, Get, Query } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditLog } from '../entities/auditLog'; // Verifique se o caminho está correto (auditLog ou audit-log)

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async findAll(@Query() query: any): Promise<AuditLog[]> {
    // Agora sim, ele captura os parâmetros da URL e manda para o Service
    return await this.auditService.findAll(query);
  }
}
