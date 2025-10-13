import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateChatTables1735689600000 implements MigrationInterface {
  name = 'CreateChatTables1735689600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension if not exists
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create conversations table
    await queryRunner.query(`
      CREATE TABLE "conversations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_conversations" PRIMARY KEY ("id")
      )
    `);

    // Create messages table
    await queryRunner.query(`
      CREATE TABLE "messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "content" text NOT NULL,
        "sender_id" uuid NOT NULL,
        "conversation_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_messages" PRIMARY KEY ("id")
      )
    `);

    // Create conversation_participants junction table
    await queryRunner.query(`
      CREATE TABLE "conversation_participants" (
        "conversation_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        CONSTRAINT "PK_conversation_participants" PRIMARY KEY ("conversation_id", "user_id")
      )
    `);

    // Add foreign keys
    await queryRunner.query(`
      ALTER TABLE "messages"
      ADD CONSTRAINT "FK_messages_sender"
      FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "messages"
      ADD CONSTRAINT "FK_messages_conversation"
      FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "conversation_participants"
      ADD CONSTRAINT "FK_conversation_participants_conversation"
      FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "conversation_participants"
      ADD CONSTRAINT "FK_conversation_participants_user"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_messages_conversation" ON "messages" ("conversation_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_messages_sender" ON "messages" ("sender_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_conversation_participants_user" ON "conversation_participants" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_conversation_participants_user"`);
    await queryRunner.query(`DROP INDEX "IDX_messages_sender"`);
    await queryRunner.query(`DROP INDEX "IDX_messages_conversation"`);
    await queryRunner.query(`ALTER TABLE "conversation_participants" DROP CONSTRAINT "FK_conversation_participants_user"`);
    await queryRunner.query(`ALTER TABLE "conversation_participants" DROP CONSTRAINT "FK_conversation_participants_conversation"`);
    await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_messages_conversation"`);
    await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_messages_sender"`);
    await queryRunner.query(`DROP TABLE "conversation_participants"`);
    await queryRunner.query(`DROP TABLE "messages"`);
    await queryRunner.query(`DROP TABLE "conversations"`);
  }
}