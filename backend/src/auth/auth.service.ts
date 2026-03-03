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
    const hashManual =
      '$2b$10$Xo8v314W8.Rtm1X35f1uS.7yWpC6iR/eN.X2Ea0N9R5H9o3r3I.G.';
    const testeIsolado = await bcrypt.compare('admin123', hashManual);
    console.log('--- TESTE DE LABORATÓRIO ---');
    console.log('O BcryptJS funciona com admin123?', testeIsolado);

    if (!user) {
      console.log('LOG: Usuário não encontrado:', loginInformado);
      return null;
    }

    // 2. Agora que temos o 'user', limpamos e testamos
    const senhaLimpa = senhaDigitada.trim();
    const hashLimpo = user.senha.trim();

    console.log('--- DEBUG DE PRODUÇÃO ---');
    console.log('Login informado:', loginInformado);
    console.log('Senha (original):', `|${senhaDigitada}|`);
    console.log('Senha (limpa):', `|${senhaLimpa}|`);
    console.log('Hash do banco:', `|${hashLimpo}|`);
    console.log('Tamanho da Senha:', senhaLimpa.length);
    console.log('Tamanho do Hash:', hashLimpo.length);

    // 3. Comparamos usando os valores limpos
    const isMatch = await bcrypt.compare(senhaLimpa, hashLimpo);

    console.log('✅ Usuário achado! Senha bateu?', isMatch);

    if (isMatch) {
      const userSeguro = { ...user };
      const { senha: _, ...result } = userSeguro;
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
