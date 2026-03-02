import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1772402650160 implements MigrationInterface {
  name = 'InitialSchema1772402650160';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "curso" ("id" SERIAL NOT NULL, "nome" character varying NOT NULL, "valorMensalidade" double precision, "qtdeTermos" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_76073a915621326fb85f28ecc5d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "financeiro" ("id" SERIAL NOT NULL, "descricao" character varying NOT NULL, "valorTotal" double precision, "dataVencimento" character varying NOT NULL, "dataPagamento" text, "status" character varying NOT NULL DEFAULT 'Aberta', "tipo" character varying NOT NULL DEFAULT 'Receita', "alunoId" integer, "matriculaId" integer, CONSTRAINT "PK_fb4c57a7f0259a95bc190d193f6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "aula" ("id" SERIAL NOT NULL, "data" TIMESTAMP, "status" character varying NOT NULL DEFAULT 'Pendente', "motivoFalta" text, "obs" text, "criadoEm" TIMESTAMP DEFAULT now(), "atualizadoEm" TIMESTAMP DEFAULT now(), "termo_id" integer, CONSTRAINT "PK_f4b5d2e277c6146e2572c6ee76a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "matricula_termo" ("id" SERIAL NOT NULL, "numeroTermo" integer NOT NULL, "nota1" double precision, "dataProva1" date, "nota2" double precision, "dataProva2" date, "obs" text, "matriculaId" integer, CONSTRAINT "PK_6bcbe1da5c4ee00562433a7f916" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "matricula" ("id" SERIAL NOT NULL, "diaSemana" character varying, "horario" character varying, "frequencia" character varying NOT NULL DEFAULT 'Semanal', "professor" character varying, "tipo" character varying NOT NULL DEFAULT 'Presencial', "termo_atual" integer NOT NULL DEFAULT '1', "situacao" character varying NOT NULL DEFAULT 'Em Andamento', "valorMatricula" numeric(10,2) NOT NULL, "valorMensalidade" numeric(10,2) NOT NULL, "valorCombustivel" numeric(10,2), "diaVencimento" integer NOT NULL, "dataInicio" TIMESTAMP NOT NULL DEFAULT now(), "dataTrancamento" date, "dataTermino" date, "criadoEm" TIMESTAMP NOT NULL DEFAULT now(), "atualizadoEm" TIMESTAMP NOT NULL DEFAULT now(), "aluno_id" integer, "curso_id" integer, CONSTRAINT "PK_0068575ec520ea5f11d79d8629d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "aluno" ("id" SERIAL NOT NULL, "nome" character varying NOT NULL, "cpf" character varying(11), "dataNascimento" date, "nomePai" character varying, "nomeMae" character varying, "cep" character varying, "endereco" character varying, "numero" character varying, "complemento" character varying, "bairro" character varying, "cidade" character varying, "telefone" character varying, "ativo" boolean NOT NULL DEFAULT true, "criadoEm" TIMESTAMP DEFAULT now(), "atualizadoEm" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_9611d4cf7a77574063439cf46b2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "usuarios" ("id" SERIAL NOT NULL, "nome" character varying NOT NULL, "email" character varying NOT NULL, "senha" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'user', "primeiroAcesso" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "audit_logs" ("id" SERIAL NOT NULL, "table_name" character varying NOT NULL, "action" character varying NOT NULL, "old_values" jsonb, "new_values" jsonb, "user_name" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "financeiro" ADD CONSTRAINT "FK_ddc70d940b44322fb264b0cef57" FOREIGN KEY ("alunoId") REFERENCES "aluno"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "financeiro" ADD CONSTRAINT "FK_9ac88a92fe15711fe293e1ed4ab" FOREIGN KEY ("matriculaId") REFERENCES "matricula"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "aula" ADD CONSTRAINT "FK_cee50f10aa67c9b0fa83328c574" FOREIGN KEY ("termo_id") REFERENCES "matricula_termo"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "matricula_termo" ADD CONSTRAINT "FK_cbb01c8c32cfc6551e3ef0ff26e" FOREIGN KEY ("matriculaId") REFERENCES "matricula"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "matricula" ADD CONSTRAINT "FK_5bcde84469025ffafe7f6d1f08f" FOREIGN KEY ("aluno_id") REFERENCES "aluno"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "matricula" ADD CONSTRAINT "FK_9fd3475edf58e822ac5e0b27aeb" FOREIGN KEY ("curso_id") REFERENCES "curso"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "matricula" DROP CONSTRAINT "FK_9fd3475edf58e822ac5e0b27aeb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "matricula" DROP CONSTRAINT "FK_5bcde84469025ffafe7f6d1f08f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "matricula_termo" DROP CONSTRAINT "FK_cbb01c8c32cfc6551e3ef0ff26e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "aula" DROP CONSTRAINT "FK_cee50f10aa67c9b0fa83328c574"`,
    );
    await queryRunner.query(
      `ALTER TABLE "financeiro" DROP CONSTRAINT "FK_9ac88a92fe15711fe293e1ed4ab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "financeiro" DROP CONSTRAINT "FK_ddc70d940b44322fb264b0cef57"`,
    );
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TABLE "usuarios"`);
    await queryRunner.query(`DROP TABLE "aluno"`);
    await queryRunner.query(`DROP TABLE "matricula"`);
    await queryRunner.query(`DROP TABLE "matricula_termo"`);
    await queryRunner.query(`DROP TABLE "aula"`);
    await queryRunner.query(`DROP TABLE "financeiro"`);
    await queryRunner.query(`DROP TABLE "curso"`);
  }
}
