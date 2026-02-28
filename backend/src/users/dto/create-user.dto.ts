//Local: src/usuarios/dto/create-user.dto.ts

import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MinLength,
} from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  SECRETARIA = 'secretaria',
  PROFESSOR = 'professor',
  USER = 'user',
}

export class CreateUserDto {
  @IsString({ message: 'O nome deve ser um texto' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  nome: string;

  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @IsEnum(UserRole, { message: 'Nível de acesso inválido' })
  role: UserRole;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  senha?: string;
}
