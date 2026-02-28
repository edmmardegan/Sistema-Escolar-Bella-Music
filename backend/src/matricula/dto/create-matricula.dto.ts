//Local: /src/matricula/dto/create-matricula.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  ValidateIf,
} from 'class-validator';

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

export class CreateMatriculaDto {
  @IsNumber()
  aluno: any;

  @IsNumber()
  curso: any;

  // ✅ CORREÇÃO 1: Mudei de @IsDateString para @IsString
  @IsOptional()
  @IsString()
  situacao: string;

  @IsDateString()
  dataInicio: string;

  // ✅ CORREÇÃO 2: Aceitando NULL do React com ValidateIf
  @IsOptional()
  @ValidateIf((o) => o.dataTrancamento !== null)
  @IsDateString()
  dataTrancamento?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.dataTermino !== null)
  @IsDateString()
  dataTermino?: string | null;

  @IsEnum(DiaSemana, { message: 'Selecione um dia da semana válido' })
  diaSemana: DiaSemana;

  @IsString()
  @IsNotEmpty()
  horario: string;

  @IsEnum(Frequencia)
  frequencia: Frequencia;

  @IsNumber()
  diaVencimento: number;

  @IsNumber()
  valorMensalidade: number;

  @IsOptional()
  @IsNumber()
  valorCombustivel?: number;

  @IsOptional()
  @IsNumber()
  valorMatricula?: number;

  // ✅ CORREÇÃO 3: Adicionando os campos que o React envia para a "Lista Branca"
  @IsOptional()
  @IsString()
  tipo?: string;

  @IsOptional()
  @IsString()
  professor?: string;

  @IsOptional()
  @IsNumber()
  termo_atual?: number;
}
