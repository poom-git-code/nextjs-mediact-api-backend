-- Migration สำหรับเพิ่ม PIPEDA compliance encryption fields ใน users table
-- วันที่: August 30, 2025
-- วัตถุประสงค์: เพิ่มระบบ encryption/decryption สำหรับข้อมูลส่วนบุคคลที่ละเอียดอ่อน

-- เพิ่ม fields สำหรับ encrypted PII data (PIPEDA compliance)
ALTER TABLE users 
-- Encrypted PII fields
ADD COLUMN email_encrypted TEXT NULL COMMENT 'AES-256-GCM encrypted email address for PIPEDA compliance',
ADD COLUMN first_name_encrypted TEXT NULL COMMENT 'AES-256-GCM encrypted first name for PIPEDA compliance',
ADD COLUMN last_name_encrypted TEXT NULL COMMENT 'AES-256-GCM encrypted last name for PIPEDA compliance',
ADD COLUMN phone_number_encrypted TEXT NULL COMMENT 'AES-256-GCM encrypted phone number for PIPEDA compliance',
ADD COLUMN date_of_birth_encrypted TEXT NULL COMMENT 'AES-256-GCM encrypted date of birth for PIPEDA compliance',
ADD COLUMN id_card_number_encrypted TEXT NULL COMMENT 'AES-256-GCM encrypted ID card number for PIPEDA compliance',
ADD COLUMN passport_number_encrypted TEXT NULL COMMENT 'AES-256-GCM encrypted passport number for PIPEDA compliance',
ADD COLUMN occupation_number_encrypted TEXT NULL COMMENT 'AES-256-GCM encrypted occupation number for PIPEDA compliance',
ADD COLUMN ID_line_encrypted TEXT NULL COMMENT 'AES-256-GCM encrypted LINE ID for PIPEDA compliance',

-- Search hash fields (for encrypted data lookup without decryption)
ADD COLUMN email_hash VARCHAR(64) NULL COMMENT 'SHA-256 hash for encrypted email search (PIPEDA compliant)',
ADD COLUMN phone_number_hash VARCHAR(64) NULL COMMENT 'SHA-256 hash for encrypted phone search (PIPEDA compliant)',
ADD COLUMN id_card_number_hash VARCHAR(64) NULL COMMENT 'SHA-256 hash for encrypted ID card search (PIPEDA compliant)',

-- Migration tracking and encryption metadata
ADD COLUMN is_encrypted BOOLEAN DEFAULT FALSE COMMENT 'Flag indicating if user PII data is encrypted',
ADD COLUMN encryption_version VARCHAR(10) DEFAULT 'v1.0' COMMENT 'Version of encryption algorithm used for future upgrades',
ADD COLUMN encryption_migrated_at TIMESTAMP NULL COMMENT 'Timestamp when user data was encrypted',

-- PIPEDA compliance and consent tracking
ADD COLUMN data_retention_date DATE NULL COMMENT 'Date when user data should be deleted per PIPEDA (default 7 years)',
ADD COLUMN consent_given_date DATE NULL COMMENT 'Date when user gave consent for personal data processing',
ADD COLUMN consent_withdrawn_date DATE NULL COMMENT 'Date when user withdrew consent for data processing',
ADD COLUMN privacy_policy_version VARCHAR(10) DEFAULT 'v1.0' COMMENT 'Version of privacy policy user agreed to',

-- Performance indexes for encrypted data search
ADD INDEX idx_email_hash (email_hash),
ADD INDEX idx_phone_hash (phone_number_hash),
ADD INDEX idx_id_card_hash (id_card_number_hash),
ADD INDEX idx_is_encrypted (is_encrypted),
ADD INDEX idx_encryption_version (encryption_version),
ADD INDEX idx_data_retention (data_retention_date),
ADD INDEX idx_consent_given (consent_given_date),
ADD INDEX idx_consent_withdrawn (consent_withdrawn_date);

-- Update table comment for PIPEDA compliance
ALTER TABLE users COMMENT = 'User accounts table with PIPEDA compliance encryption for Canadian privacy laws';

-- Insert/Update audit settings สำหรับ users table encryption
INSERT INTO audit_settings (table_name, auto_audit_enabled, track_select, track_insert, track_update, track_delete, exclude_columns) VALUES
('users_encryption', TRUE, TRUE, TRUE, TRUE, TRUE, '["email_encrypted", "phone_number_encrypted", "id_card_number_encrypted", "passport_number_encrypted"]')
ON DUPLICATE KEY UPDATE
auto_audit_enabled = TRUE,
track_select = TRUE,
exclude_columns = '["email_encrypted", "phone_number_encrypted", "id_card_number_encrypted", "passport_number_encrypted"]';

-- สร้าง stored procedure สำหรับ PIPEDA data cleanup
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS CleanupExpiredUserData()
COMMENT 'PIPEDA compliance: Clean up user data that has exceeded retention period'
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE user_id_var INT;
    DECLARE retention_date_var DATE;
    
    -- Cursor สำหรับหา users ที่ข้อมูลหมดอายุแล้ว
    DECLARE expired_cursor CURSOR FOR 
        SELECT id, data_retention_date 
        FROM users 
        WHERE data_retention_date IS NOT NULL 
        AND data_retention_date <= CURDATE()
        AND consent_withdrawn_date IS NULL; -- ยกเว้น users ที่ถอนความยินยอมแล้ว
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN expired_cursor;
    
    cleanup_loop: LOOP
        FETCH expired_cursor INTO user_id_var, retention_date_var;
        IF done THEN
            LEAVE cleanup_loop;
        END IF;
        
        -- Log การลบข้อมูลใน audit_logs
        INSERT INTO audit_logs (
            user_id, action, table_name, record_id, 
            old_values, new_values, changes, auto_audit
        ) VALUES (
            1, -- System user
            'PIPEDA_DATA_CLEANUP',
            'users',
            user_id_var,
            JSON_OBJECT('reason', 'PIPEDA data retention period exceeded'),
            JSON_OBJECT('retention_date', retention_date_var, 'cleanup_date', CURDATE()),
            JSON_OBJECT('fields_cleaned', 'PII data anonymized per PIPEDA requirements'),
            TRUE
        );
        
        -- ทำการ anonymize ข้อมูล PII
        UPDATE users SET
            email = CONCAT('deleted_', user_id_var, '@anonymized.local'),
            email_encrypted = NULL,
            email_hash = NULL,
            first_name = 'ANONYMIZED',
            first_name_encrypted = NULL,
            last_name = 'USER',
            last_name_encrypted = NULL,
            phone_number = NULL,
            phone_number_encrypted = NULL,
            phone_number_hash = NULL,
            date_of_birth = NULL,
            date_of_birth_encrypted = NULL,
            id_card_number = NULL,
            id_card_number_encrypted = NULL,
            id_card_number_hash = NULL,
            passport_number = NULL,
            passport_number_encrypted = NULL,
            occupation_number = NULL,
            occupation_number_encrypted = NULL,
            ID_line = NULL,
            ID_line_encrypted = NULL,
            profile_picture = NULL,
            id_card_url = NULL,
            passport_url = NULL,
            occupation_document_url = NULL,
            data_retention_date = NULL -- Reset retention date after cleanup
        WHERE id = user_id_var;
        
    END LOOP;
    
    CLOSE expired_cursor;
    
    -- Return summary
    SELECT 
        COUNT(*) as users_cleaned,
        CURDATE() as cleanup_date,
        'PIPEDA compliance data cleanup completed' as status;
END //

DELIMITER ;

-- สร้าง event scheduler สำหรับทำ cleanup อัตโนมัติ (รันทุกเดือน)
-- DROP EVENT IF EXISTS pipeda_monthly_cleanup;
-- CREATE EVENT pipeda_monthly_cleanup
-- ON SCHEDULE EVERY 1 MONTH
-- STARTS CURRENT_TIMESTAMP
-- DO
--   CALL CleanupExpiredUserData();

-- แสดงสถานะการ migration
SELECT 
    'Users table PIPEDA encryption migration completed' as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_encrypted = TRUE THEN 1 END) as encrypted_users,
    COUNT(CASE WHEN consent_given_date IS NOT NULL THEN 1 END) as users_with_consent,
    COUNT(CASE WHEN data_retention_date IS NOT NULL THEN 1 END) as users_with_retention_date
FROM users;
