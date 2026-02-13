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
} from '@nestjs/common';
import { MatriculaService } from './matricula.service';
import { CreateMatriculaDto } from './dto/create-matricula.dto';
import { UpdateTermoDto } from './dto/update-termo.dto';

@Controller('matriculas')
export class MatriculaController {
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
  update(@Param('id') id: string, @Body() body: CreateMatriculaDto) {
    return this.service.save({ ...body, id: +id });
  }

  @Patch('termo/:id')
  updateTermo(@Param('id') id: string, @Body() body: UpdateTermoDto) {
    return this.service.updateTermo(+id, body);
  }

  @Get('termo/:id')
  getBoletim(@Param('id') id: string) {
    return this.service.getDetalhesBoletim(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
