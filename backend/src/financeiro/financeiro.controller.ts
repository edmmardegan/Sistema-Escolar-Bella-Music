// src/financeiro/financeiro.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { FinanceiroService } from './financeiro.service';
import { GerarLoteDto } from './dto/gerar-lote.dto';
import { ReajusteAnualDto } from './dto/reajuste-anual.dto';
import { Financeiro } from '../entities/financeiro.entity';

@Controller('financeiro')
export class FinanceiroController {
  constructor(private readonly service: FinanceiroService) {}

  @Get()
  async findAll(): Promise<Financeiro[]> {
    return await this.service.findAll();
  }

  @Post('gerar-lote-anual')
  async gerarLote(
    @Body() body: GerarLoteDto,
  ): Promise<{ gerados: number; totalParcelas: number }> {
    // CORRIGIDO: Agora chama o nome correto do Service
    return await this.service.gerarParcelaGlobal(body);
  }

  @Post('reajuste-global')
  async reajuste(@Body() body: ReajusteAnualDto): Promise<any> {
    return await this.service.aplicarReajusteAnual(body);
  }

  @Get('matricula/:id')
  async findByMatricula(@Param('id', ParseIntPipe) id: number) {
    return await this.service.findByMatricula(id);
  }

  @Post(':id/pagar')
  async pagar(@Param('id', ParseIntPipe) id: number): Promise<Financeiro> {
    return await this.service.atualizarStatus(id, 'Paga');
  }

  @Post(':id/estornar')
  async estornar(@Param('id', ParseIntPipe) id: number): Promise<Financeiro> {
    return await this.service.atualizarStatus(id, 'Aberta');
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return await this.service.remove(id);
  }
}
