import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConversationMenuFields1761483757787 implements MigrationInterface {
    name = 'AddConversationMenuFields1761483757787'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversations" ADD "pinnedBy" text array NOT NULL DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "conversations" ADD "blockedBy" text array NOT NULL DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "conversations" ADD "reportedBy" text array NOT NULL DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "conversations" ADD "deletedBy" text array NOT NULL DEFAULT '{}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversations" DROP COLUMN "deletedBy"`);
        await queryRunner.query(`ALTER TABLE "conversations" DROP COLUMN "reportedBy"`);
        await queryRunner.query(`ALTER TABLE "conversations" DROP COLUMN "blockedBy"`);
        await queryRunner.query(`ALTER TABLE "conversations" DROP COLUMN "pinnedBy"`);
    }

}
