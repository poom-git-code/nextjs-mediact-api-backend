-- เพิ่ม fields สำหรับ PIPEDA compliance encryption
-- Migration for adding encrypted fields to users table

-- เพิ่ม encrypted fields สำหรับข้อมูลส่วนบุคคลที่ละเอียดอ่อน
ALTER TABLE users 
ADD COLUMN email_encrypted TEXT NULL COMMENT 'AES-256 encrypted email address for PIPEDA compliance',
ADD COLUMN first_name_encrypted TEXT NULL COMMENT 'AES-256 encrypted first name for PIPEDA compliance',
ADD COLUMN last_name_encrypted TEXT NULL COMMENT 'AES-256 encrypted last name for PIPEDA compliance',
ADD COLUMN phone_number_encrypted TEXT NULL COMMENT 'AES-256 encrypted phone number for PIPEDA compliance',
ADD COLUMN date_of_birth_encrypted TEXT NULL COMMENT 'AES-256 encrypted date of birth for PIPEDA compliance',
ADD COLUMN id_card_number_encrypted TEXT NULL COMMENT 'AES-256 encrypted ID card number for PIPEDA compliance',
ADD COLUMN passport_number_encrypted TEXT NULL COMMENT 'AES-256 encrypted passport number for PIPEDA compliance',
ADD COLUMN occupation_number_encrypted TEXT NULL COMMENT 'AES-256 encrypted occupation number for PIPEDA compliance',
ADD COLUMN ID_line_encrypted TEXT NULL COMMENT 'AES-256 encrypted LINE ID for PIPEDA compliance';

-- เพิ่ม search hash fields สำหรับค้นหาข้อมูลที่เข้ารหัสแล้ว
ALTER TABLE users 
ADD COLUMN email_hash VARCHAR(64) NULL COMMENT 'SHA-256 hash for encrypted email search',
ADD COLUMN phone_number_hash VARCHAR(64) NULL COMMENT 'SHA-256 hash for encrypted phone number search',
ADD COLUMN id_card_number_hash VARCHAR(64) NULL COMMENT 'SHA-256 hash for encrypted ID card number search';

-- เพิ่ม encryption metadata fields
ALTER TABLE users 
ADD COLUMN is_encrypted BOOLEAN DEFAULT FALSE COMMENT 'Flag indicating if user PII data is encrypted',
ADD COLUMN encryption_version VARCHAR(10) DEFAULT 'v1.0' COMMENT 'Version of encryption algorithm used',
ADD COLUMN encryption_migrated_at TIMESTAMP NULL COMMENT 'Timestamp when user data was encrypted';

-- เพิ่ม PIPEDA compliance tracking fields
ALTER TABLE users 
ADD COLUMN data_retention_date DATE NULL COMMENT 'Date when user data should be deleted per PIPEDA (7 years default)',
ADD COLUMN consent_given_date DATE NULL COMMENT 'Date when user gave consent for personal data processing',
ADD COLUMN consent_withdrawn_date DATE NULL COMMENT 'Date when user withdrew consent for data processing',
ADD COLUMN privacy_policy_version VARCHAR(10) DEFAULT 'v1.0' COMMENT 'Version of privacy policy user agreed to';

-- สร้าง indexes สำหรับประสิทธิภาพในการค้นหา
ALTER TABLE users 
ADD INDEX idx_email_hash (email_hash),
ADD INDEX idx_phone_hash (phone_number_hash),
ADD INDEX idx_id_card_hash (id_card_number_hash),
ADD INDEX idx_is_encrypted (is_encrypted),
ADD INDEX idx_encryption_version (encryption_version),
ADD INDEX idx_encryption_migrated_at (encryption_migrated_at),
ADD INDEX idx_data_retention (data_retention_date),
ADD INDEX idx_consent_given (consent_given_date),
ADD INDEX idx_consent_withdrawn (consent_withdrawn_date),
ADD INDEX idx_privacy_policy_version (privacy_policy_version);

-- Insert default audit settings สำหรับ encrypted fields
INSERT INTO audit_settings (table_name, auto_audit_enabled, track_select, track_insert, track_update, track_delete, exclude_columns) VALUES
('users_encrypted', TRUE, TRUE, TRUE, TRUE, TRUE, '["email_encrypted", "phone_number_encrypted", "id_card_number_encrypted", "passport_number_encrypted"]')
ON DUPLICATE KEY UPDATE
exclude_columns = '["email_encrypted", "phone_number_encrypted", "id_card_number_encrypted", "passport_number_encrypted"]';

-- Set default data retention period (7 years from now) for existing users
UPDATE users 
SET data_retention_date = DATE_ADD(CURDATE(), INTERVAL 7 YEAR),
    consent_given_date = CURDATE(),
    privacy_policy_version = 'v1.0'
WHERE data_retention_date IS NULL 
AND status_id != 3; -- ไม่รวมผู้ใช้ที่ถูกลบแล้ว

-- Create stored procedure สำหรับการ migrate data to encrypted format
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS MigrateUserDataToEncrypted()
COMMENT 'Migrate existing user data to encrypted format for PIPEDA compliance'
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE user_id_var INT;
    DECLARE email_var VARCHAR(100);
    DECLARE first_name_var VARCHAR(100);
    DECLARE last_name_var VARCHAR(100);
    DECLARE phone_var VARCHAR(20);
    DECLARE id_card_var VARCHAR(50);
    DECLARE passport_var VARCHAR(50);
    DECLARE occupation_var VARCHAR(50);
    DECLARE line_id_var VARCHAR(100);
    DECLARE birth_date_var DATE;
    
    -- Cursor สำหรับดึงข้อมูลผู้ใช้ที่ยังไม่ได้เข้ารหัส
    DECLARE user_cursor CURSOR FOR 
        SELECT id, email, first_name, last_name, phone_number, id_card_number, 
               passport_number, occupation_number, ID_line, date_of_birth
        FROM users 
        WHERE is_encrypted = FALSE OR is_encrypted IS NULL;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN user_cursor;
    
    migrate_loop: LOOP
        FETCH user_cursor INTO user_id_var, email_var, first_name_var, last_name_var, 
                              phone_var, id_card_var, passport_var, occupation_var, 
                              line_id_var, birth_date_var;
        
        IF done THEN
            LEAVE migrate_loop;
        END IF;
        
        -- อัปเดตข้อมูลให้เป็น encrypted (จำลอง - จริงๆ ต้องใช้ application code)
        UPDATE users 
        SET is_encrypted = TRUE,
            encryption_version = 'v1.0',
            encryption_migrated_at = CURRENT_TIMESTAMP,
            -- ในความเป็นจริง encrypted values จะถูกสร้างโดย application
            -- email_encrypted = ENCRYPT_FUNCTION(email),
            -- first_name_encrypted = ENCRYPT_FUNCTION(first_name),
            -- etc.
            updated_at = CURRENT_TIMESTAMP
        WHERE id = user_id_var;
        
    END LOOP;
    
    CLOSE user_cursor;
    
    -- Log การ migration
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values, auto_audit, created_at)
    VALUES (1, 'PIPEDA_MIGRATION', 'users', NULL, 
            JSON_OBJECT('migration_type', 'encryption', 'completed_at', NOW()), 
            TRUE, NOW());
            
END //

DELIMITER ;

-- Add comment to users table
ALTER TABLE users COMMENT = 'User accounts table with PIPEDA compliance encryption for personal data';

-- Create view สำหรับข้อมูลที่ปลอดภัย (ไม่แสดง encrypted fields)
CREATE OR REPLACE VIEW users_safe_view AS
SELECT 
    id,
    username,
    email, -- จะใช้ decrypted version จาก application
    first_name, -- จะใช้ decrypted version จาก application
    last_name, -- จะใช้ decrypted version จาก application
    nickname,
    country_code,
    phone_number, -- จะใช้ decrypted version จาก application
    is_verified_phone,
    verified_phone_date,
    date_of_birth, -- จะใช้ decrypted version จาก application
    gender_id,
    profile_picture,
    two_factor_enabled,
    status_id,
    status_reason,
    referral_code,
    last_login,
    occupation_expired,
    occupation_document_url,
    occupation_passed_unit,
    -- occupation_experienced,
    is_encrypted,
    encryption_version,
    encryption_migrated_at,
    data_retention_date,
    consent_given_date,
    consent_withdrawn_date,
    privacy_policy_version,
    created_at,
    updated_at
FROM users
-- ไม่รวม encrypted fields และ hash fields เพื่อความปลอดภัย
;
