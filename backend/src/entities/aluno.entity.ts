import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Matricula } from './matricula.entity';

@Entity('aluno')
export class Aluno {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column({ type: 'date', nullable: true })
  dataNascimento: Date;

  @Column({ nullable: true })
  telefone: string;

  @Column({ default: true })
  ativo: boolean;

  @Column({ nullable: true })
  nomePai: string;

  @Column({ nullable: true })
  nomeMae: string;

  @Column({ nullable: true })
  rua: string;

  @Column({ nullable: true })
  bairro: string;

  @Column({ nullable: true })
  cidade: string;

  @Column({ type: 'varchar', length: 11, nullable: true })
  cpf: string;

  // Este "hook" limpa o CPF antes de inserir ou atualizar no banco
  @BeforeInsert()
  @BeforeUpdate()
  limparCpf() {
    if (this.cpf) {
      this.cpf = this.cpf.replace(/\D/g, ''); // Remove tudo que não for número
    }
  }

  // --- DATAS DE AUDITORIA ---
  @CreateDateColumn({ type: 'timestamp', nullable: true })
  criadoEm: Date; // Preenche automático a data de cadastro

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  atualizadoEm: Date; // Atualiza sozinho sempre que você editar o aluno

  @OneToMany(() => Matricula, (matricula) => matricula.aluno)
  matriculas: Matricula[];
}
