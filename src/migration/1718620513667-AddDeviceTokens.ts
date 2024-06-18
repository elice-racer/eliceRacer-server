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
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
          created_at timestamp without time zone DEFAULT now() NOT NULL,
          updated_at timestamp without time zone DEFAULT now() NOT NULL,
          token character varying NOT NULL,
          "userId" uuid
        );
      `);

      // Add foreign key constraint
      await queryRunner.query(`
        ALTER TABLE device_token
        ADD CONSTRAINT "fk_user" FOREIGN KEY ("userId") REFERENCES users(id);
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

      // Drop foreign key constraint
      await queryRunner.query(`
        ALTER TABLE device_token DROP CONSTRAINT "fk_user";
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
