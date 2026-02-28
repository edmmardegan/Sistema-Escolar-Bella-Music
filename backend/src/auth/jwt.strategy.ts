//Local: /src/auth/jwt.strategy.ts

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'SECRETA', // Use a mesma chave que está no AuthModule
    });
  }

  async validate(payload: any) {
    // Buscamos no banco para garantir que o usuário ainda existe
    const user = await this.usersService.findOne(payload.username);

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado ou inativo');
    }

    //    return { userId: payload.sub, email: payload.username, role: payload.role };
    return {
      userId: payload.sub,
      email: payload.email || payload.username, // Tenta os dois nomes
      nome: payload.nome || 'Usuário',
      role: payload.role,
    };
  }
}
