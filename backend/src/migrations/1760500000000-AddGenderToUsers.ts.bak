import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGenderToUsers1760500000000 implements MigrationInterface {
    name = 'AddGenderToUsers1760500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "gender" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "gender"`);
    }
}
