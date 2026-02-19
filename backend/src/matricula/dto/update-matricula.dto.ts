import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
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

export class UpdateMatriculaDto {
  @IsNumber()
  aluno!: any; // O TypeORM aceita o ID ou o objeto

  @IsNumber()
  curso!: any;

  @IsString()
  situacao!: string;

  @IsDateString()
  dataInicio!: string;

  @IsString()
  professor?: string;

  @IsOptional()
  @IsDateString()
  dataTrancamento?: string;

  @IsOptional()
  @IsDateString()
  dataTermino?: string;

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
