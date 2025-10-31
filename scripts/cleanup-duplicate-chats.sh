#!/bin/bash
# Script to clean up duplicate conversations in the Aurora database

echo "Starting cleanup of duplicate conversations..."

# Define database connection parameters
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="aurora_db"
DB_USER="aurora_user"
DB_PASSWORD="your_password"

# SQL script to find and remove duplicate conversations
SQL_SCRIPT="
-- First, identify duplicate conversations (same participants)
WITH duplicate_conversations AS (
  SELECT 
    c1.id,
    c1.participants,
    c1.updated_at,
    ROW_NUMBER() OVER (
      PARTITION BY 
        CASE 
          WHEN c1.participants[1] < c1.participants[2] 
          THEN c1.participants[1] || '-' || c1.participants[2]
          ELSE c1.participants[2] || '-' || c1.participants[1]
        END
      ORDER BY c1.updated_at DESC
    ) AS rn
  FROM conversations c1
  WHERE array_length(c1.participants, 1) = 2
),
conversations_to_delete AS (
  SELECT id 
  FROM duplicate_conversations 
  WHERE rn > 1
)
-- Delete messages from duplicate conversations
DELETE FROM messages 
WHERE \"conversationId\" IN (SELECT id FROM conversations_to_delete);

-- Delete duplicate conversations
WITH duplicate_conversations AS (
  SELECT 
    c1.id,
    c1.participants,
    c1.updated_at,
    ROW_NUMBER() OVER (
      PARTITION BY 
        CASE 
          WHEN c1.participants[1] < c1.participants[2] 
          THEN c1.participants[1] || '-' || c1.participants[2]
          ELSE c1.participants[2] || '-' || c1.participants[1]
        END
      ORDER BY c1.updated_at DESC
    ) AS rn
  FROM conversations c1
  WHERE array_length(c1.participants, 1) = 2
),
conversations_to_delete AS (
  SELECT id 
  FROM duplicate_conversations 
  WHERE rn > 1
)
DELETE FROM conversations 
WHERE id IN (SELECT id FROM conversations_to_delete)
RETURNING id;
"

# Execute the SQL script
echo "Executing cleanup script..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "$SQL_SCRIPT"

echo "Cleanup completed!"
echo ""
echo "To prevent future duplicates, make sure to:"
echo "1. Use the updated chat.service.ts"
echo "2. Apply the database migration"
echo "3. Restart the backend service"

