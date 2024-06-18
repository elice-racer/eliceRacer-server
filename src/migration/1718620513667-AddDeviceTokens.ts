import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeviceTokens1718620513667 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction();
    try {
      // Modify 'type' column in 'chats' table to be NOT NULL
      await queryRunner.query(`
                ALTER TABLE chats ALTER COLUMN type SET NOT NULL;
            `);

      // Create 'device_token' table
      await queryRunner.query(`
                CREATE TABLE device_token (
                    id uuid PRIMARY KEY NOT NULL,
                    created_at timestamp without time zone NOT NULL,
                    updated_at timestamp without time zone NOT NULL,
                    token character varying NOT NULL,
                    userId uuid
                );
            `);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction();
    try {
      // Revert 'type' column in 'chats' table to allow NULL
      await queryRunner.query(`
                ALTER TABLE chats ALTER COLUMN type DROP NOT NULL;
            `);

      // Drop 'device_token' table
      await queryRunner.query(`
                DROP TABLE device_token;
            `);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    }
  }
}
