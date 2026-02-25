import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/auditLog';

@Controller('audit')
export class AuditController {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  @Get()
  findAll() {
    return this.repo.find({ order: { created_at: 'DESC' }, take: 50 });
  }
}
