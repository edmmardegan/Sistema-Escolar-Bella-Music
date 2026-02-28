// Local: /src/aluno/aluno.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseIntPipe,
  Req, // 👈 Adicione o Req
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
  create(@Body() dados: CreateAlunoDto, @Req() req: any) {
    // Pegamos o username do JWT (req.user.email ou username conforme seu payload)
    const userName = req.user?.email || req.user?.username || 'SISTEMA_LOCAL';
    return this.service.save(dados, userName);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: UpdateAlunoDto,
    @Req() req: any,
  ) {
    console.log('👤 Usuário logado na requisição:', req.user);
    const userName = req.user?.email || req.user?.username || 'SISTEMA_LOCAL';

    // Unimos o ID com os dados para o método save
    const dadosCompletos = { ...dados, id };

    return this.service.save(dadosCompletos as any, userName);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
