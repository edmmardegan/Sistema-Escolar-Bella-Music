// Local: src/curso/curso.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { CursoService } from './curso.service';

@Controller('cursos')
export class CursoController {
  constructor(private readonly service: CursoService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dados: any) {
    return this.service.save(dados);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dados: any) {
    // Garantimos que o ID do parâmetro seja injetado no objeto
    return this.service.save({ ...dados, id: +id });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
