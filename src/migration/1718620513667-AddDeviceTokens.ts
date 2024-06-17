import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeviceTokens1718620513667 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE chats ALTER COLUMN type SET NOT NULL;
    `);

    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    await queryRunner.query(`
      CREATE TABLE device_token (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at timestamp without time zone NOT NULL DEFAULT now(),
        updated_at timestamp without time zone NOT NULL DEFAULT now(),
        token character varying NOT NULL,
        "userId" uuid,
        CONSTRAINT fk_user FOREIGN KEY ("userId") REFERENCES users(id)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE chats ALTER COLUMN type DROP NOT NULL;
    `);

    await queryRunner.query(`
      DROP TABLE device_token;
    `);
  }
}
