// Local: /src/app.module.ts

import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AlsService } from './auth/als.service';
import { AuditMiddleware } from './auth/audit.middleware';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';

// --- ENTIDADES ---
import { Aluno } from './entities/aluno.entity';
import { User } from './entities/user.entity';
import { Aula } from './entities/aula.entity';
import { Curso } from './entities/curso.entity';
import { Matricula } from './entities/matricula.entity';
import { Financeiro } from './entities/financeiro.entity';
import { MatriculaTermo } from './entities/matricula-termo.entity';
import { AuditLog } from './entities/auditLog';

// --- MÓDULOS ---
import { AgendaModule } from './agenda/agenda.module';
import { AlunoModule } from './aluno/aluno.module';
import { CursoModule } from './curso/curso.module';
import { MatriculaModule } from './matricula/matricula.module';
import { FinanceiroModule } from './financeiro/financeiro.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AuditModule } from './audit/audit.module';

// --- DEFINIÇÃO DO ENV ---
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile =
  nodeEnv === 'production' ? '.env.production' : '.env.development';

//console.log('====================================');
//console.log('🚀 Ambiente:', nodeEnv);
//console.log('📄 Arquivo .env carregado:', envFile);
//console.log('====================================');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envFile,
    }),

    // ✅ CONFIGURAÇÃO CORRETA DO TYPEORM
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('DB_HOST');
        const port = config.get<number>('DB_PORT');
        const database = config.get<string>('DB_DATABASE');
        const username = config.get<string>('DB_USERNAME');
        const password = config.get<string>('DB_PASSWORD');

        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          entities: [
            User,
            Aluno,
            Aula,
            Curso,
            Financeiro,
            Matricula,
            MatriculaTermo,
            AuditLog,
          ],
          synchronize: false,
        };
      },
    }),

    AgendaModule,
    AuditModule,
    UsersModule,
    AuthModule,
    AlunoModule,
    CursoModule,
    MatriculaModule,
    FinanceiroModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    AppService,
    AlsService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuditMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
