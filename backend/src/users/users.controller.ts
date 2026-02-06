// Local: src/usuarios/users.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('usuarios')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  findAll() {
    return this.service.findAll();
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

  @Patch(':id/reset-password-admin')
  resetAdmin(@Param('id') id: string, @Body('novaSenha') novaSenha: string) {
    return this.service.updatePassword(+id, novaSenha, true);
  }

  @Patch(':id/update-own-password')
  updateOwn(@Param('id') id: string, @Body('novaSenha') novaSenha: string) {
    return this.service.updatePassword(+id, novaSenha, false);
  }
}
