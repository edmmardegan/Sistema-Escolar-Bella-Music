// src/agenda/agenda.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AgendaService } from './agenda.service';
import { RegistrarFrequenciaDto } from './dto/registrar-frequencia.dto';
import { GerarCicloDto } from './dto/gerar-ciclo.dto';
import { Aula } from '../entities/aula.entity';

@Controller('agenda')
export class AgendaController {
  constructor(private readonly service: AgendaService) {}

  @Get()
  async findAll(
    @Query('tipo') tipo: string,
    @Query('data') data?: string,
    @Query('dataFim') dataFim?: string,
    @Query('nome') nome?: string,
  ): Promise<Aula[]> {
    return await this.service.findAll(tipo, data, dataFim, nome);
  }

  @Post('gerar')
  async gerarMensal(
    @Body() corpo: GerarCicloDto,
  ): Promise<{ message: string }> {
    // Chamada corrigida para o nome exato no Service
    return await this.service.gerarMensal(corpo.mes, corpo.ano);
  }

  @Patch(':id/frequencia')
  async atualizarFrequencia(
    @Param('id', ParseIntPipe) id: number,
    @Body() corpo: RegistrarFrequenciaDto,
  ): Promise<any> {
    return await this.service.registrarFrequencia(id, corpo.acao, corpo.motivo);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    return await this.service.remove(id);
  }
}
