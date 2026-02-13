import { IsInt, Min, Max } from 'class-validator';

export class GerarLoteDto {
  @IsInt({ message: 'O mês de início deve ser um número inteiro' })
  @Min(1, { message: 'Mês mínimo é 1 (Janeiro)' })
  @Max(12, { message: 'Mês máximo é 12 (Dezembro)' })
  mes: number;

  @IsInt({ message: 'O ano deve ser um número inteiro' })
  @Min(2024, { message: 'Ano mínimo permitido é 2024' })
  ano: number;
}
