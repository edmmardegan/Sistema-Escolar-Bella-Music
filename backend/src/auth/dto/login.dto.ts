import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Por favor, insira um e-mail válido' })
  email: string;

  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @IsString()
  //@MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  password: string;
}
