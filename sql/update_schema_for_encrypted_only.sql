-- Update database schema to allow NULL values for plain text fields
-- This enables transition to encrypted-only storage

-- Make plain text PII fields nullable
ALTER TABLE Users 
MODIFY COLUMN email VARCHAR(255) NULL,
MODIFY COLUMN first_name VARCHAR(255) NULL,
MODIFY COLUMN last_name VARCHAR(255) NULL,
MODIFY COLUMN phone_number VARCHAR(50) NULL,
MODIFY COLUMN national_id VARCHAR(20) NULL,
MODIFY COLUMN address TEXT NULL,
MODIFY COLUMN emergency_contact VARCHAR(255) NULL,
MODIFY COLUMN emergency_phone VARCHAR(50) NULL;

-- Add comments to clarify new architecture
ALTER TABLE Users 
MODIFY COLUMN email VARCHAR(255) NULL COMMENT 'Deprecated: Use email_encrypted field',
MODIFY COLUMN first_name VARCHAR(255) NULL COMMENT 'Deprecated: Use first_name_encrypted field',
MODIFY COLUMN last_name VARCHAR(255) NULL COMMENT 'Deprecated: Use last_name_encrypted field',
MODIFY COLUMN phone_number VARCHAR(50) NULL COMMENT 'Deprecated: Use phone_number_encrypted field',
MODIFY COLUMN national_id VARCHAR(20) NULL COMMENT 'Deprecated: Use national_id_encrypted field',
MODIFY COLUMN address TEXT NULL COMMENT 'Deprecated: Use address_encrypted field',
MODIFY COLUMN emergency_contact VARCHAR(255) NULL COMMENT 'Deprecated: Use emergency_contact_encrypted field',
MODIFY COLUMN emergency_phone VARCHAR(50) NULL COMMENT 'Deprecated: Use emergency_phone_encrypted field';
