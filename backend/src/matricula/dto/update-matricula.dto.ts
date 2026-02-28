//Local: /src/matricula/dto/update-matricula.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  ValidateIf,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateMatriculaDto } from './create-matricula.dto';

export enum DiaSemana {
  SEGUNDA = 'Segunda',
  TERCA = 'Terca',
  QUARTA = 'Quarta',
  QUINTA = 'Quinta',
  SEXTA = 'Sexta',
  SABADO = 'Sabado',
  DOMINGO = 'Domingo',
}

export enum Frequencia {
  SEMANAL = 'Semanal',
  QUINZENAL = 'Quinzenal',
}

export class UpdateMatriculaDto extends PartialType(CreateMatriculaDto) {
  @IsNumber()
  aluno!: any; // O TypeORM aceita o ID ou o objeto

  @IsNumber()
  curso!: any;

  @IsString()
  situacao!: string;

  @IsString()
  @IsNotEmpty({ message: 'O campo tipo é obrigatório' })
  tipo: string;

  @IsString()
  @IsNotEmpty({ message: 'O campo professor é obrigatório' })
  professor: string;

  @IsNumber()
  @IsNotEmpty({ message: 'O campo termo_atual é obrigatório' })
  termo_atual: number;

  @IsDateString({}, { message: 'A data de início deve ser uma data válida' })
  @IsNotEmpty({ message: 'A data de início é obrigatória' })
  dataInicio!: string; // 🔒 Obrigatória

  @IsOptional()
  @ValidateIf((o) => o.dataTrancamento !== null) // 👈 SÓ VALIDA SE NÃO FOR NULL
  @IsDateString()
  dataTrancamento?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.dataTermino !== null) // 👈 SÓ VALIDA SE NÃO FOR NULL
  @IsDateString()
  dataTermino?: string | null;

  @IsEnum(DiaSemana, { message: 'Selecione um dia da semana válido' })
  diaSemana!: DiaSemana;

  @IsString()
  @IsNotEmpty()
  horario!: string;

  @IsEnum(Frequencia)
  frequencia!: Frequencia;

  @IsNumber()
  diaVencimento!: number;

  @IsNumber()
  valorMensalidade: number;

  @IsOptional()
  @IsNumber()
  valorCombustivel?: number;

  @IsOptional()
  @IsNumber()
  valorMatricula?: number;
}
