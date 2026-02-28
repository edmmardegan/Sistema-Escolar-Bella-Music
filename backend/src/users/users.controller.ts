//Local: src/usuarios/users.controller.ts

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
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
@UseGuards(JwtAuthGuard)
@Controller('usuarios')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() body: CreateUserDto) {
    return this.service.save(body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
    @Req() req: any,
  ) {
    const userName = req.user?.email || 'SISTEMA'; // 👈 Se o JWT estiver ok, aqui vem o e-mail do admin logado
    return this.service.save({ ...body, id: +id }, userName);
  }

  // Mude de 'update-own-password' para 'reset-password-admin'
  @Patch(':id/reset-password-admin')
  resetAdmin(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const userName = req.user?.email || 'SISTEMA';
    // Garante que pega a senha independente do nome do campo no body
    const senhaFinal = body.novaSenha || body.senha || body.password;

    return this.service.updatePassword(+id, senhaFinal, false, userName);
  }
}
