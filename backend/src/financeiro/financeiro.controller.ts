// src/financeiro/financeiro.controller.ts
import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { FinanceiroService } from './financeiro.service';
import { GerarLoteDto } from './dto/gerar-lote.dto';
import { ReajusteAnualDto } from './dto/reajuste-anual.dto';

@Controller('financeiro')
export class FinanceiroController {
  constructor(private readonly service: FinanceiroService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post('gerar-lote-anual')
  gerarLote(@Body() body: GerarLoteDto) {
    // Passamos o objeto body inteiro para o service
    return this.service.gerarCicloGlobal(body);
  }

  @Post('reajuste-global')
  async reajuste(@Body() body: ReajusteAnualDto) {
    // Passamos o objeto body inteiro para o service
    return await this.service.aplicarReajusteAnual(body);
  }

  @Post(':id/pagar')
  pagar(@Param('id') id: string) {
    return this.service.atualizarStatus(+id, 'Paga');
  }

  @Post(':id/estornar')
  estornar(@Param('id') id: string) {
    return this.service.atualizarStatus(+id, 'Aberta');
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
