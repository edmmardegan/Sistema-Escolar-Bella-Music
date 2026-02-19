import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// --- IMPORTAÇÃO DAS ENTIDADES ---
// Verifique se todos esses arquivos estão dentro da pasta src/entities/
import { Aluno } from './entities/aluno.entity';
import { User } from './entities/user.entity';
import { Aula } from './entities/aula.entity';
import { Curso } from './entities/curso.entity';
import { Matricula } from './entities/matricula.entity';
import { Financeiro } from './entities/financeiro.entity';

// --- IMPORTAÇÃO DOS MÓDULOS ---
import { AgendaModule } from './agenda/agenda.module';
import { AlunoModule } from './aluno/aluno.module';
import { CursoModule } from './curso/curso.module';
import { MatriculaModule } from './matricula/matricula.module';
import { FinanceiroModule } from './financeiro/financeiro.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MatriculaTermo } from './entities/matricula-termo.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'evandro',
      password: String(process.env.DB_PASSWORD || '123456'),
      database: process.env.DB_DATABASE || 'escolaron',
      entities: [
        User,
        Aluno,
        Aula,
        Curso,
        Financeiro,
        Matricula,
        MatriculaTermo,
      ],
      synchronize: true,
    }),

    // Módulos do Sistema
    AgendaModule,
    UsersModule,
    AuthModule,
    AlunoModule,
    CursoModule,
    MatriculaModule,
    FinanceiroModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
