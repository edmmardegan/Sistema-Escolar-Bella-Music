//Local: /src/agenda.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgendaController } from './agenda.controller';
import { AgendaService } from './agenda.service';
import { Aula } from '../entities/aula.entity';
import { Matricula } from '../entities/matricula.entity';
import { MatriculaTermo } from '../entities/matricula-termo.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    // Importante: registrar todas as entidades que o Service usa
    TypeOrmModule.forFeature([Aula, Matricula, MatriculaTermo]),
    AuditModule,
  ],
  controllers: [AgendaController],
  providers: [AgendaService],
})
export class AgendaModule {}
