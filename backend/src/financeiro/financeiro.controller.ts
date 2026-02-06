// Local: src/financeiro/financeiro.controller.ts

import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { FinanceiroService } from './financeiro.service';

@Controller('financeiro')
export class FinanceiroController {
  constructor(private readonly service: FinanceiroService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post('gerar-lote-anual')
  gerarLote(@Body() body: { mes: number; ano: number }) {
    // Passamos os dois parâmetros para o service
    return this.service.gerarCicloGlobal(body.mes, body.ano);
  }

  @Post(':id/pagar')
  pagar(@Param('id') id: string) {
    return this.service.atualizarStatus(+id, 'Paga');
  }

  @Post(':id/estornar')
  estornar(@Param('id') id: string) {
    return this.service.atualizarStatus(+id, 'Aberta');
  }

  @Post('reajuste-global')
  async reajuste(@Body() body: { ano: number; aumento: number }) {
    return await this.service.aplicarReajusteAnual(body.ano, body.aumento);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
