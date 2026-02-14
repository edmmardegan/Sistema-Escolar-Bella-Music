// src/matricula/matricula.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatriculaService } from './matricula.service';
import { MatriculaController } from './matricula.controller';
import { Matricula } from '../entities/matricula.entity';
import { MatriculaTermo } from '../entities/matricula-termo.entity';
import { Financeiro } from '../entities/financeiro.entity'; // <-- Importe a entidade
import { Aula } from '../entities/aula.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Matricula,
      MatriculaTermo,
      Financeiro, // <-- ADICIONE ISSO AQUI
      Aula,
    ]),
  ],
  controllers: [MatriculaController],
  providers: [MatriculaService],
  exports: [MatriculaService],
})
export class MatriculaModule {}
