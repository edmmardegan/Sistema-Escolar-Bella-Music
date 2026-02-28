// Local: /src/matricula/matricula.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatriculaService } from './matricula.service';
import { MatriculaController } from './matricula.controller';
import { Matricula } from '../entities/matricula.entity';
import { MatriculaTermo } from '../entities/matricula-termo.entity';
import { Financeiro } from '../entities/financeiro.entity';
import { Aula } from '../entities/aula.entity';
import { AuditModule } from '../audit/audit.module'; // 👈 1. IMPORTA O MÓDULO

@Module({
  imports: [
    TypeOrmModule.forFeature([Matricula, MatriculaTermo, Financeiro, Aula]),
    AuditModule,
  ],
  controllers: [MatriculaController],
  providers: [MatriculaService],
  exports: [MatriculaService],
})
export class MatriculaModule {}
