import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Curso } from '../entities/curso.entity';
import { CursoService } from './curso.service';
import { CursoController } from './curso.controller';
import { AuditModule } from 'src/audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([Curso]), AuditModule],
  controllers: [CursoController],
  providers: [CursoService],
})
export class CursoModule {}
