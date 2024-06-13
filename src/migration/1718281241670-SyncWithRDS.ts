import { MigrationInterface, QueryRunner } from 'typeorm';

export class SyncWithRDS1687548392843 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction();
    try {
      // messages 테이블 변경
      await queryRunner.query(
        `ALTER TABLE "messages" ALTER COLUMN "content" TYPE character varying(500)`,
      );

      // notices 테이블 변경
      await queryRunner.query(
        `ALTER TABLE "notices" ALTER COLUMN "content" TYPE character varying(1000)`,
      );

      // users 테이블 변경
      await queryRunner.query(
        `ALTER TABLE "users" ADD "profile_image" character varying NULL`,
      );
      await queryRunner.query(
        `ALTER TABLE "users" ALTER COLUMN "phone_number" TYPE character varying(11)`,
      );
      await queryRunner.query(
        `ALTER TABLE "users" ALTER COLUMN "comment" TYPE character varying(100)`,
      );
      await queryRunner.query(
        `ALTER TABLE "users" ALTER COLUMN "description" TYPE character varying(1000)`,
      );
      await queryRunner.query(
        `ALTER TABLE "users" ALTER COLUMN "tmi" TYPE character varying(1000)`,
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction();
    try {
      // users 테이블 롤백
      await queryRunner.query(
        `ALTER TABLE "users" DROP COLUMN "profile_image"`,
      );
      await queryRunner.query(
        `ALTER TABLE "users" ALTER COLUMN "phone_number" TYPE character varying`,
      );
      await queryRunner.query(
        `ALTER TABLE "users" ALTER COLUMN "comment" TYPE character varying`,
      );
      await queryRunner.query(
        `ALTER TABLE "users" ALTER COLUMN "description" TYPE character varying`,
      );
      await queryRunner.query(
        `ALTER TABLE "users" ALTER COLUMN "tmi" TYPE character varying`,
      );

      // notices 테이블 롤백
      await queryRunner.query(
        `ALTER TABLE "notices" ALTER COLUMN "content" TYPE character varying`,
      );

      // messages 테이블 롤백
      await queryRunner.query(
        `ALTER TABLE "messages" ALTER COLUMN "content" TYPE character varying`,
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    }
  }
}
