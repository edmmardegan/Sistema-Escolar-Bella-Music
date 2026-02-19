import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Aluno } from './aluno.entity';
import { Matricula } from './matricula.entity';

@Entity('financeiro')
export class Financeiro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  descricao: string;

  @Column('float', { nullable: true }) // <--- ADICIONE O { nullable: true } AQUI
  valorTotal: number;

  @Column()
  dataVencimento: string;

  @Column({ type: 'text', nullable: true })
  dataPagamento: string | null;

  @Column({ default: 'Aberta' })
  status: string;

  @Column({ default: 'Receita' })
  tipo: string;

  @ManyToOne(() => Aluno, { eager: true }) // Eager true faz ele carregar o aluno sempre
  aluno: Aluno;

  @ManyToOne(() => Matricula, { eager: true }) // Carrega a matrícula sempre
  matricula: Matricula;
}
