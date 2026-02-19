import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateCursoDto {
  @IsString({ message: 'O nome deve ser um texto' })
  @IsNotEmpty({ message: 'O nome do curso é obrigatório' })
  nome: string;

  @IsNumber({}, { message: 'O valor deve ser um número' })
  @Min(0, { message: 'O valor não pode ser negativo' })
  valorMensalidade: number;

  @IsNumber({}, { message: 'A duração deve ser um número' })
  @Min(1, { message: 'A duração mínima é de 1 termo' })
  qtdeTermos: number;
}
