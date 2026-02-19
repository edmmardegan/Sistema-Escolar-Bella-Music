import { IsInt, IsNumber, Min } from 'class-validator';

export class ReajusteAnualDto {
  @IsInt({ message: 'O ano deve ser um número inteiro' })
  @Min(2024)
  ano: number;

  @IsNumber({}, { message: 'O valor do aumento deve ser um número' })
  @Min(0.01, { message: 'O aumento deve ser no mínimo 0.01' })
  aumento: number;
}
