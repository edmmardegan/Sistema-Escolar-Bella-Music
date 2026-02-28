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
  Req,
} from '@nestjs/common';
import { AgendaService } from './agenda.service';
import { RegistrarFrequenciaDto } from './dto/registrar-frequencia.dto';
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
  async gerarMensal(@Body() corpo: any, @Req() req: any) {
    // 👈 Req adicionado
    const { mes, ano } = corpo;
    const userName = req.user?.email || 'SISTEMA';
    return await this.service.gerarMensal(Number(mes), Number(ano), userName);
  }

  @Patch(':id/frequencia')
  async atualizarFrequencia(
    @Param('id', ParseIntPipe) id: number,
    @Body() corpo: RegistrarFrequenciaDto,
    @Req() req: any, // 👈 Req adicionado
  ): Promise<any> {
    const userName = req.user?.email || 'SISTEMA';
    return await this.service.registrarFrequencia(
      id,
      corpo.acao,
      corpo.motivo,
      userName,
    );
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any, // 👈 Req adicionado
  ): Promise<{ success: boolean }> {
    const userName = req.user?.email || 'SISTEMA';
    return await this.service.remove(id, userName);
  }
}
