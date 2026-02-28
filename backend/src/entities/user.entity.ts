//Local: /src/entities/users.entity.ts

import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'usuarios' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  email: string;

  @Column()
  senha: string; // Nome que decidimos usar no código e no banco

  @Column({ default: 'user' })
  role: string;

  @Column({ default: true })
  primeiroAcesso: boolean;
}
