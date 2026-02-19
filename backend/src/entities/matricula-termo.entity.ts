import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Matricula } from './matricula.entity';
import { Aula } from './aula.entity';

@Entity('matricula_termo')
export class MatriculaTermo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  numeroTermo: number;

  // Alterado: notaTeorica -> nota1
  @Column('float', { nullable: true })
  nota1: number;

  // Adicionado: Data da Prova 1
  @Column({ type: 'date', nullable: true })
  dataProva1: string | null;

  // Alterado: notaPratica -> nota2
  @Column('float', { nullable: true })
  nota2: number;

  // Adicionado: Data da Prova 2
  @Column({ type: 'date', nullable: true })
  dataProva2: string | null;

  // Adicionado: Campo de Observações
  @Column({ type: 'text', nullable: true })
  obs: string | null;

  @ManyToOne(() => Matricula, (matricula) => matricula.termos, {
    onDelete: 'CASCADE',
  })
  matricula: Matricula;

  @OneToMany(() => Aula, (aula) => aula.termo)
  aulas: Aula[];
}
