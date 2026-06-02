-- Create duty_types table
-- This table stores master data for types of user duty entries

CREATE TABLE IF NOT EXISTS duty_types (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary key',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique string code (e.g., shift, leave)',
    name VARCHAR(100) NOT NULL COMMENT 'Display name of the duty type (e.g., เข้าเวร, ลา)',
    description TEXT DEFAULT NULL COMMENT 'Description or purpose of this duty type',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this type is active/usable',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record last update timestamp',
    created_by INT DEFAULT NULL COMMENT 'User ID who created this record',
    updated_by INT DEFAULT NULL COMMENT 'User ID who last updated this record',
    
    -- Indexes for performance
    INDEX idx_duty_types_code (code),
    INDEX idx_duty_types_name (name),
    INDEX idx_duty_types_is_active (is_active),
    INDEX idx_duty_types_created_by (created_by),
    INDEX idx_duty_types_updated_by (updated_by),
    
    -- Foreign key constraints
    CONSTRAINT fk_duty_types_created_by 
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_duty_types_updated_by 
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
        
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Master table for types of user duty entries';

-- Insert default duty types
INSERT INTO duty_types (code, name, description, is_active, created_by, updated_by) VALUES
('shift', 'เข้าเวร', 'เข้าเวรทำงานปกติ', TRUE, 1, 1),
('leave', 'ลา', 'ลางานทุกประเภท', TRUE, 1, 1),
('overtime', 'ทำงานล่วงเวลา', 'ทำงานนอกเวลาปกติ', TRUE, 1, 1),
('holiday', 'วันหยุด', 'วันหยุดเทศกาล/วันหยุดนักขัตฤกษ์', TRUE, 1, 1),
('sick_leave', 'ลาป่วย', 'ลาป่วยหรือไม่สบาย', TRUE, 1, 1),
('vacation', 'ลาพักร้อน', 'ลาพักร้อนประจำปี', TRUE, 1, 1),
('business_trip', 'เดินทางธุรกิจ', 'เดินทางไปปฏิบัติงานนอกสถานที่', TRUE, 1, 1),
('training', 'อบรม', 'เข้าร่วมการอบรมหรือประชุม', TRUE, 1, 1),
('meeting', 'ประชุม', 'เข้าร่วมการประชุม', TRUE, 1, 1),
('standby', 'เตรียมพร้อม', 'อยู่ในโหมดเตรียมพร้อมรับงาน', TRUE, 1, 1)
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    description = VALUES(description),
    is_active = VALUES(is_active),
    updated_by = VALUES(updated_by),
    updated_at = CURRENT_TIMESTAMP;
