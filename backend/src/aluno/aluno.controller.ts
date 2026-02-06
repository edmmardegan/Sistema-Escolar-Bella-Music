// Local: src/aluno/aluno.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { AlunoService } from './aluno.service';

@Controller('alunos')
export class AlunoController {
  constructor(private readonly service: AlunoService) {}

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
    // Garantimos que o ID do parâmetro vá para o objeto antes de salvar
    return this.service.save({ ...dados, id: +id });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
