import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    loginInformado: string,
    senhaDigitada: string,
  ): Promise<Partial<User> | null> {
    const user = await this.usersService.findOne(loginInformado);

    if (!user) {
      console.log('LOG: Usuário não encontrado:', loginInformado);
      return null;
    }

    const isMatch = await bcrypt.compare(senhaDigitada, user.senha);

    if (isMatch) {
      // 1. Criamos a cópia
      const userSeguro = { ...user };

      // 2. Extraímos a senha.
      // Não tipamos o 'result' na declaração para evitar o conflito.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { senha: _, ...result } = userSeguro;

      // 3. Retornamos fazendo o cast para o tipo que a função espera.
      // Isso diz ao TS: "Pode confiar, esse objeto agora é um Usuário Parcial"
      return result as Partial<User>;
    }

    console.log('LOG: Senha incorreta para:', loginInformado);
    return null;
  }

  async login(user: Partial<User>) {
    const payload = {
      sub: user.id,
      role: user.role,
      email: user.email,
      nome: user.nome,
      primeiroAcesso: user.primeiroAcesso,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        primeiroAcesso: user.primeiroAcesso,
      },
    };
  }
}
