import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateTermoDto {
  @IsNumber()
  @Min(0)
  @Max(10)
  nota1: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  nota2: number;

  @IsOptional()
  @IsString()
  dataProva1?: string;

  @IsOptional()
  @IsString()
  dataProva2?: string;

  @IsOptional()
  @IsString()
  obs?: string;
}
