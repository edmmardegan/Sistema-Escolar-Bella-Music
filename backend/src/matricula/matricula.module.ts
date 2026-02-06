import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Matricula } from '../entities/matricula.entity';
import { MatriculaTermo } from '../entities/matricula-termo.entity';
import { Aula } from '../entities/aula.entity'; // Certifique-se de importar a entidade
import { MatriculaService } from './matricula.service';
import { MatriculaController } from './matricula.controller';
import { AgendaService } from '../agenda/agenda.service'; // Importar o Service
import { AgendaController } from '../agenda/agenda.controller'; // Importar o Controller que criamos agora

@Module({
  imports: [
    TypeOrmModule.forFeature([Matricula, MatriculaTermo, Aula]), // Certifique-se que Matricula está aqui
  ],
  controllers: [MatriculaController, AgendaController],
  providers: [MatriculaService, AgendaService],
})
export class MatriculaModule {}
