import { MigrationInterface, QueryRunner } from 'typeorm';

export class CleanupDuplicateConversations1699000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Clean up duplicate conversations
    // Find all conversations with duplicate participant pairs
    const duplicates = await queryRunner.query(`
      WITH participant_pairs AS (
        SELECT 
          id,
          participants,
          CASE 
            WHEN participants[1] < participants[2] 
            THEN participants[1] || '-' || participants[2]
            ELSE participants[2] || '-' || participants[1]
          END AS participant_key,
          updated_at,
          ROW_NUMBER() OVER (
            PARTITION BY 
              CASE 
                WHEN participants[1] < participants[2] 
                THEN participants[1] || '-' || participants[2]
                ELSE participants[2] || '-' || participants[1]
              END
            ORDER BY updated_at DESC
          ) AS rn
        FROM conversations
        WHERE array_length(participants, 1) = 2
      )
      SELECT id 
      FROM participant_pairs 
      WHERE rn > 1
    `);

    // Delete duplicate conversations (keeping the most recent one)
    for (const dup of duplicates) {
      await queryRunner.query(`DELETE FROM messages WHERE "conversationId" = $1`, [dup.id]);
      await queryRunner.query(`DELETE FROM conversations WHERE id = $1`, [dup.id]);
    }

    // Step 2: Create a unique constraint on sorted participants
    // First, create a function to sort participant arrays
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION sort_participants(text[]) 
      RETURNS text[] AS $$
      BEGIN
        RETURN (SELECT ARRAY(SELECT unnest($1) ORDER BY 1));
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;
    `);

    // Create a unique index on sorted participants with exactly 2 participants
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_unique_participant_pairs 
      ON conversations(sort_participants(participants))
      WHERE array_length(participants, 1) = 2;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the unique index
    await queryRunner.query(`DROP INDEX IF EXISTS idx_unique_participant_pairs`);
    
    // Drop the function
    await queryRunner.query(`DROP FUNCTION IF EXISTS sort_participants(text[])`);
  }
}
