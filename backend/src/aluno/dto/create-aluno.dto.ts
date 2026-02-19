import {
  IsString,
  IsOptional,
  Length,
  IsNotEmpty,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from 'class-validator';
import { cpf } from 'cpf-cnpj-validator';

@ValidatorConstraint({ name: 'cpfValido', async: false })
export class CpfValidoConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    // 1. Se não houver valor (campo opcional vazio), é válido por aqui
    if (value === null || value === undefined || value === '') {
      return true;
    }

    // 2. Garantimos que o valor é string ou número antes de prosseguir
    let valorParaValidar: string;

    if (typeof value === 'string') {
      valorParaValidar = value;
    } else if (typeof value === 'number') {
      valorParaValidar = String(value);
    } else {
      // Se for qualquer outra coisa (objeto, array, etc), é inválido
      return false;
    }

    // 3. Agora que temos certeza que é uma string real, validamos
    return !!cpf.isValid(valorParaValidar);
  }

  defaultMessage(args?: ValidationArguments): string {
    return `O CPF informado (${args?.value}) é matematicamente inválido`;
  }
}

export class CreateAlunoDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  nome: string;

  @IsOptional()
  @IsString()
  @Length(11, 14, { message: 'O CPF deve ter entre 11 e 14 caracteres' })
  @Validate(CpfValidoConstraint)
  cpf?: string;

  @IsOptional() @IsString() telefone?: string;
  @IsOptional() @IsString() dataNascimento?: string;
  @IsOptional() @IsString() nomePai?: string;
  @IsOptional() @IsString() nomeMae?: string;
  @IsOptional() @IsString() rua?: string;
  @IsOptional() @IsString() bairro?: string;
  @IsOptional() @IsString() cidade?: string;
}
