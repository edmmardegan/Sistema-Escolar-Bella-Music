import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { AlunoService } from './aluno.service';
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { UpdateAlunoDto } from './dto/update-aluno.dto';
@Controller('alunos')
export class AlunoController {
  constructor(private readonly service: AlunoService) {}

  @Get('aniversariantes')
  async buscarAniversariantes() {
    return await this.service.buscarAniversariantes();
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dados: CreateAlunoDto) {
    return this.service.save(dados);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dados: UpdateAlunoDto) {
    // Criamos uma constante com o tipo esperado pelo Service
    // Isso une os dados do DTO com o ID numérico
    const dadosCompletos: CreateAlunoDto & { id?: number } = {
      ...dados,
      id,
    } as any;

    return this.service.save(dadosCompletos);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
