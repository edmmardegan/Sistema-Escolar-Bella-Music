// Local: src/agenda/agenda.controller.ts

import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { AgendaService } from './agenda.service';
import { RegistrarFrequenciaDto } from './dto/registrar-frequencia.dto';
import { GerarCicloDto } from './dto/gerar-ciclo.dto';

@Controller('agenda')
export class AgendaController {
  constructor(private readonly service: AgendaService) {}

  @Get()
  async findAll(
    @Query('tipo') tipo: string,
    @Query('data') data?: string,
    @Query('dataFim') dataFim?: string,
    @Query('nome') nome?: string,
  ) {
    return this.service.findAll(tipo, data, dataFim, nome);
  }

  @Post('gerar')
  gerarMensal(@Body() corpo: GerarCicloDto) {
    // Agora usa o DTO
    return this.service.gerarCicloMensal(corpo.mes, corpo.ano);
  }

  @Patch(':id/frequencia')
  atualizarFrequencia(
    @Param('id') id: string,
    @Body() corpo: RegistrarFrequenciaDto, // Agora usa o DTO
  ) {
    return this.service.registrarFrequencia(+id, corpo.acao, corpo.motivo);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
