-- Add seq column to user_group_tags table
-- Migration: Add sequence number for ordering group tags
-- Date: 2025-09-11

-- Add seq column
ALTER TABLE user_group_tags 
ADD COLUMN seq INTEGER DEFAULT NULL 
COMMENT 'Sequence number for ordering group tags';

-- Add index for better query performance when ordering by seq
CREATE INDEX idx_user_group_tags_department_seq 
ON user_group_tags (department_id, seq);

-- Optional: Set initial seq values based on created_at order within each department
-- This will assign sequence numbers starting from 1 for each department
SET @row_number = 0;
SET @prev_department = '';

UPDATE user_group_tags 
SET seq = (
  SELECT seq_num FROM (
    SELECT 
      id,
      @row_number := CASE 
        WHEN @prev_department = department_id THEN @row_number + 1 
        ELSE 1 
      END AS seq_num,
      @prev_department := department_id
    FROM user_group_tags 
    ORDER BY department_id, created_at
  ) AS numbered
  WHERE numbered.id = user_group_tags.id
);

-- Reset variables
SET @row_number = NULL;
SET @prev_department = NULL;

-- Show results
SELECT 
  id, 
  name, 
  department_id, 
  seq, 
  created_at 
FROM user_group_tags 
ORDER BY department_id, seq, created_at;
