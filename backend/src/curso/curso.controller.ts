import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseIntPipe,
  Req, // 👈 Certifique-se de importar o Req
} from '@nestjs/common';
import { CursoService } from './curso.service';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';

@Controller('cursos')
export class CursoController {
  constructor(private readonly service: CursoService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dados: CreateCursoDto, @Req() req: any) {
    // 1. Pegamos o usuário do JWT
    const userName = req.user?.email || 'SISTEMA';
    // 2. Passamos os DOIS argumentos: dados e userName
    return this.service.save(dados, userName);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: UpdateCursoDto,
    @Req() req: any,
  ) {
    const userName = req.user?.email || 'SISTEMA';
    // 3. Passamos os DOIS argumentos: objeto com ID e userName
    return this.service.save({ ...dados, id }, userName);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userName = req.user?.email || 'SISTEMA';
    // 4. Passamos os DOIS argumentos: id e userName
    return this.service.remove(id, userName);
  }
}
