import { IsInt, Min, Max } from 'class-validator';

export class GerarCicloDto {
  @IsInt({ message: 'O mês deve ser um número inteiro' })
  @Min(0, { message: 'Mês inicial é 0 (Janeiro)' })
  @Max(11, { message: 'Mês final é 11 (Dezembro)' })
  mes: number;

  @IsInt({ message: 'O ano deve ser um número inteiro' })
  @Min(2024, { message: 'Ano mínimo permitido é 2024' })
  ano: number;
}
