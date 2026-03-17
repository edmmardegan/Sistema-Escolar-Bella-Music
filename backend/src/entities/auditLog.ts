// src/entities/auditLog.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  table_name: string;

  @Column()
  action: string;

  // Novo campo para salvar "Aluno X - Curso Y" ou "Email do Usuário"
  @Column({ nullable: true })
  context: string;

  @Column({ type: 'jsonb', nullable: true })
  old_values: any;

  @Column({ type: 'jsonb', nullable: true })
  new_values: any;

  @Column({ nullable: true })
  user_name: string;

  @CreateDateColumn()
  created_at: Date;
}
