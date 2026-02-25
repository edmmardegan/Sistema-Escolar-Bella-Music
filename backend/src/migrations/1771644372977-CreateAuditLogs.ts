import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateAuditLogs1771644372977 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true, // Nullable caso o sistema faça ações automáticas
          },
          {
            name: 'action',
            type: 'varchar',
            length: '20', // INSERT, UPDATE, DELETE
          },
          {
            name: 'table_name',
            type: 'varchar',
          },
          {
            name: 'registration_id',
            type: 'varchar',
            isNullable: true, // ID do registro que foi alterado
          },
          {
            name: 'old_values',
            type: 'jsonb',
            isNullable: true, // Valores antes da alteração
          },
          {
            name: 'new_values',
            type: 'jsonb',
            isNullable: true, // Valores depois da alteração
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Opcional: Chave estrangeira para a tabela de usuários
    await queryRunner.createForeignKey(
      'audit_logs',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users', // Certifique-se que sua tabela de usuários se chama 'users'
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('audit_logs');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('user_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('audit_logs', foreignKey);
      }
    }
    await queryRunner.dropTable('audit_logs');
  }
}
