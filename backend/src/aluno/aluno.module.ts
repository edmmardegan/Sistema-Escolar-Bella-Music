import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aluno } from '../entities/aluno.entity';
import { AlunoService } from './aluno.service';
import { AlunoController } from './aluno.controller';
import { AuditLog } from '../entities/auditLog';
import { AuditModule } from 'src/audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([Aluno, AuditLog]), AuditModule], // Libera o uso do banco de dados para Aluno
  controllers: [AlunoController],
  providers: [AlunoService],
})
export class AlunoModule {}
