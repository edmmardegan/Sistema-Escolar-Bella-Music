//Local: /src/app.module.ts

import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AlsService } from './auth/als.service';
import { AuditMiddleware } from './auth/audit.middleware';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'evandro',
      password: String(process.env.DB_PASSWORD || '123456'),
      database: process.env.DB_DATABASE || 'escolaron_dev',
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
      subscribers: [],
      synchronize: true, //synchronize: true, mudar para false quando estiver em produção
    }),
    // ✅ Importante para o repositório de Log ser injetável
    //    TypeOrmModule.forFeature([AuditLog]),
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
      useClass: JwtAuthGuard, // Isso protege a API inteira!
    },
    AppService,
    AlsService,
  ],
  //providers: [AppService, AuditSubscriber, AlsService],
})
export class AppModule {
  // Configuração do Middleware para capturar o usuário em todas as rotas
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuditMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
