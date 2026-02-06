// Local: src/matricula/matricula.controller.ts

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

@Controller('matriculas')
export class MatriculaController {
  constructor(private readonly service: MatriculaService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('termo/:id')
  getBoletim(@Param('id') id: string) {
    return this.service.getDetalhesBoletim(+id);
  }

  @Post()
  create(@Body() body: any) {
    return this.service.save(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.save({ ...body, id: +id });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }

  @Patch('termo/:id')
  updateTermo(@Param('id') id: string, @Body() body: any) {
    return this.service.updateTermo(+id, body);
  }
}
