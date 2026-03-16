// Local: src/auth/auth.service,ts

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
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
    // 1. Primeiro buscamos o usuário
    const user = await this.usersService.findOne(loginInformado);

    if (!user) {
      return null;
    }

    // 2. Agora que temos o 'user', limpamos e testamos
    const senhaLimpa = senhaDigitada.trim();
    const hashLimpo = user.senha.trim();

    // 3. Comparamos usando os valores limpos
    const isMatch = await bcrypt.compare(senhaLimpa, hashLimpo);

    if (isMatch) {
      const userSeguro = { ...user };
      const { senha: _, ...result } = userSeguro;
      return result as Partial<User>;
    }

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
