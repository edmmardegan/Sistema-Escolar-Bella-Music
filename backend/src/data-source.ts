import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Aluno } from './entities/aluno.entity';
import { Matricula } from './entities/matricula.entity';
import { MatriculaTermo } from './entities/matricula-termo.entity';
import { Curso } from './entities/curso.entity';
import { Aula } from './entities/aula.entity';
import { Financeiro } from './entities/financeiro.entity';
import { User } from './entities/user.entity';

// Importe aqui as outras que você tiver, ex: Professor, Turma, etc.

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'evandro',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'escolaron',
  synchronize: false,
  logging: true,
  entities: [
    Aluno,
    Matricula,
    Curso,
    Aula,
    Financeiro,
    User,
    MatriculaTermo,
    // Adicione as outras classes aqui também
  ],
  migrations: ['./src/migrations/*.ts'],
});
