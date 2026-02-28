// src/matricula/matricula.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Patch,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { MatriculaService } from './matricula.service';
import { CreateMatriculaDto } from './dto/create-matricula.dto';
import { UpdateMatriculaDto } from './dto/update-matricula.dto';
import { UpdateTermoDto } from './dto/update-termo.dto';

@Controller('matriculas')
export class MatriculaController {
  // Usei 'private readonly service' para manter o padrão que você iniciou
  constructor(private readonly service: MatriculaService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() body: CreateMatriculaDto) {
    return this.service.save(body);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: UpdateMatriculaDto,
    @Req() req: any, // Pega a requisição para extrair o user
  ) {
    const userName = req.user?.email || 'SISTEMA';
    return await this.service.save({ ...dados, id }, userName);
  }

  @Patch('termo/:id')
  updateTermo(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateTermoDto,
  ) {
    return this.service.updateTermo(id, body);
  }

  @Get('termo/:id')
  getBoletim(@Param('id', ParseIntPipe) id: number) {
    return this.service.getDetalhesBoletim(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Post(':id/gerar-financeiro')
  async gerarFin(
    @Param('id', ParseIntPipe) id: number,
    @Body() corpo: { ano: number },
  ): Promise<Record<string, any>> {
    // <--- Definimos que o retorno é um objeto (Record)
    const resultado = await this.service.gerarParcelaIndividual(id, corpo.ano);
    return resultado as Record<string, any>; // <--- Fazemos o cast explícito para satisfazer o linter
  }
}
