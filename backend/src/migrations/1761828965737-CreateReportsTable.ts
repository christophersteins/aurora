import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateReportsTable1761828965737 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum types
        await queryRunner.query(`
            CREATE TYPE "reports_status_enum" AS ENUM('pending', 'reviewed', 'resolved', 'dismissed')
        `);

        await queryRunner.query(`
            CREATE TYPE "reports_category_enum" AS ENUM(
                'inappropriate_content',
                'fake_profile',
                'harassment',
                'spam',
                'scam',
                'underage',
                'other'
            )
        `);

        // Create reports table
        await queryRunner.query(`
            CREATE TABLE "reports" (
                "id" SERIAL NOT NULL,
                "reporterId" uuid,
                "reportedUserId" uuid NOT NULL,
                "category" "reports_category_enum" NOT NULL,
                "description" text NOT NULL,
                "status" "reports_status_enum" NOT NULL DEFAULT 'pending',
                "adminNotes" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "reviewedAt" TIMESTAMP,
                CONSTRAINT "PK_reports_id" PRIMARY KEY ("id")
            )
        `);

        // Add foreign keys
        await queryRunner.query(`
            ALTER TABLE "reports"
            ADD CONSTRAINT "FK_reports_reporterId"
            FOREIGN KEY ("reporterId") REFERENCES "users"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "reports"
            ADD CONSTRAINT "FK_reports_reportedUserId"
            FOREIGN KEY ("reportedUserId") REFERENCES "users"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        // Create indexes
        await queryRunner.query(`
            CREATE INDEX "IDX_reports_reporterId" ON "reports" ("reporterId")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_reports_reportedUserId" ON "reports" ("reportedUserId")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_reports_status" ON "reports" ("status")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_reports_createdAt" ON "reports" ("createdAt")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_reports_createdAt"`);
        await queryRunner.query(`DROP INDEX "IDX_reports_status"`);
        await queryRunner.query(`DROP INDEX "IDX_reports_reportedUserId"`);
        await queryRunner.query(`DROP INDEX "IDX_reports_reporterId"`);

        // Drop foreign keys
        await queryRunner.query(`ALTER TABLE "reports" DROP CONSTRAINT "FK_reports_reportedUserId"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP CONSTRAINT "FK_reports_reporterId"`);

        // Drop table
        await queryRunner.query(`DROP TABLE "reports"`);

        // Drop enum types
        await queryRunner.query(`DROP TYPE "reports_category_enum"`);
        await queryRunner.query(`DROP TYPE "reports_status_enum"`);
    }

}
