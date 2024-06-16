import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChatType1718549882670 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 사용자 정의 타입 생성
    await queryRunner.query(`CREATE TYPE "chat_type" AS (type VARCHAR(255))`);

    // chats 테이블에 type 컬럼 추가 (일시적으로 NULL 허용)
    await queryRunner.query(`ALTER TABLE "chats" ADD "type" "chat_type"`);

    // 모든 기타 레코드에 대해 기본 type 설정
    await queryRunner.query(`
            UPDATE "chats"
            SET "type" = ('TEAM'::chat_type)
            WHERE "type" IS NULL
        `);

    // type 컬럼을 NOT NULL로 변경
    await queryRunner.query(
      `ALTER TABLE "chats" ALTER COLUMN "type" SET NOT NULL`,
    );

    // chatName 컬럼 이름을 chat_name으로 변경
    await queryRunner.query(
      `ALTER TABLE "chats" RENAME COLUMN "chatName" TO "chat_name"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 변경 사항 롤백
    await queryRunner.query(
      `ALTER TABLE "chats" RENAME COLUMN "chat_name" TO "chatName"`,
    );
    await queryRunner.query(`ALTER TABLE "chats" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "chat_type"`);
  }
}
