-- Fix missing PIPEDA columns
-- Add only the missing columns if they don't exist

-- Check and add encryption_migrated_at if it doesn't exist
SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_SCHEMA = DATABASE() 
               AND TABLE_NAME = 'users' 
               AND COLUMN_NAME = 'encryption_migrated_at') = 0,
               'ALTER TABLE users ADD COLUMN encryption_migrated_at TIMESTAMP NULL COMMENT "Timestamp when user data was encrypted"',
               'SELECT "Column encryption_migrated_at already exists" as result');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add privacy_policy_version if it doesn't exist
SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_SCHEMA = DATABASE() 
               AND TABLE_NAME = 'users' 
               AND COLUMN_NAME = 'privacy_policy_version') = 0,
               'ALTER TABLE users ADD COLUMN privacy_policy_version VARCHAR(10) DEFAULT "v1.0" COMMENT "Version of privacy policy user agreed to"',
               'SELECT "Column privacy_policy_version already exists" as result');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add indexes if they don't exist
SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
               WHERE TABLE_SCHEMA = DATABASE() 
               AND TABLE_NAME = 'users' 
               AND INDEX_NAME = 'idx_encryption_migrated_at') = 0,
               'ALTER TABLE users ADD INDEX idx_encryption_migrated_at (encryption_migrated_at)',
               'SELECT "Index idx_encryption_migrated_at already exists" as result');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
               WHERE TABLE_SCHEMA = DATABASE() 
               AND TABLE_NAME = 'users' 
               AND INDEX_NAME = 'idx_privacy_policy_version') = 0,
               'ALTER TABLE users ADD INDEX idx_privacy_policy_version (privacy_policy_version)',
               'SELECT "Index idx_privacy_policy_version already exists" as result');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing users with default values
UPDATE users 
SET privacy_policy_version = 'v1.0'
WHERE privacy_policy_version IS NULL;

SELECT 'PIPEDA missing columns fix completed' as result;
