-- Add created_at column to groups table
-- Run this script manually in your database if needed

ALTER TABLE groups ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;

-- Update existing records to have a default timestamp
UPDATE groups SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;

-- Make the column NOT NULL after setting default values
ALTER TABLE groups ALTER COLUMN created_at SET NOT NULL; 