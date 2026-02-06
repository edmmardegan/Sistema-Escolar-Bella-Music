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

@Controller('agenda')
export class AgendaController {
  constructor(private readonly service: AgendaService) {}

  @Get()
  async findAll(@Query('tipo') tipo: string, @Query('data') data: string) {
    return this.service.findAll(tipo, data);
  }

  @Post('gerar')
  gerarMensal(@Body() corpo: { mes: number; ano: number }) {
    return this.service.gerarCicloMensal(corpo.mes, corpo.ano);
  }

  @Patch(':id/frequencia')
  atualizarFrequencia(
    @Param('id') id: string,
    @Body()
    corpo: { acao: 'presenca' | 'falta' | 'reposicao'; motivo?: string },
  ) {
    return this.service.registrarFrequencia(+id, corpo.acao, corpo.motivo);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
