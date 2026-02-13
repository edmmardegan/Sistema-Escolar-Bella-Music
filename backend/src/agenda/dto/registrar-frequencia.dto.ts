import { IsEnum, IsOptional, IsString } from 'class-validator';

// Definimos os tipos aceitos para não haver erro de digitação
export enum AcaoFrequencia {
  PRESENCA = 'presenca',
  FALTA = 'falta',
  REPOSICAO = 'reposicao',
}

export class RegistrarFrequenciaDto {
  @IsEnum(AcaoFrequencia, {
    message: 'Ação deve ser: presenca, falta ou reposicao',
  })
  acao: AcaoFrequencia;

  @IsOptional()
  @IsString({ message: 'O motivo deve ser um texto' })
  motivo?: string;
}
