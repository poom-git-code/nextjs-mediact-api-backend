-- Create user_duty table
-- This table stores daily duty log for each user with link to duty type (without FK)

CREATE TABLE IF NOT EXISTS user_duty (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary key',
    user_id INT NOT NULL COMMENT 'Reference to the user',
    duty_date DATE NOT NULL COMMENT 'Date of the duty (one row per duty event)',
    duty_type_id INT NOT NULL COMMENT 'Reference to duty_types.id (no FK constraint)',
    reference_id BIGINT DEFAULT NULL COMMENT 'Reference to the original record (e.g., shift_id, leave_id)',
    shift_type_id INT DEFAULT NULL COMMENT 'If duty_type = shift, reference to shift type',
    start_time TIME DEFAULT NULL COMMENT 'Start time of duty',
    end_time TIME DEFAULT NULL COMMENT 'End time of duty',
    total_hours DECIMAL(6,2) DEFAULT NULL COMMENT 'Number of hours this duty spans',
    status VARCHAR(50) DEFAULT NULL COMMENT 'Status of the duty record',
    department_id INT DEFAULT NULL COMMENT 'Department associated with the duty',
    schedule_master_id INT DEFAULT NULL COMMENT 'Schedule month this duty belongs to',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Soft delete flag',
    created_by INT DEFAULT NULL COMMENT 'User ID who created this record',
    updated_by INT DEFAULT NULL COMMENT 'User ID who last updated this record',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record last update timestamp',
    
    -- Indexes for performance
    INDEX idx_user_duty_date (user_id, duty_date),
    INDEX idx_user_duty_type (duty_type_id),
    INDEX idx_user_duty_status (status),
    INDEX idx_user_duty_department (department_id),
    INDEX idx_user_duty_schedule (schedule_master_id),
    INDEX idx_user_duty_is_active (is_active),
    INDEX idx_user_duty_created_by (created_by),
    INDEX idx_user_duty_updated_by (updated_by),
    INDEX idx_user_duty_reference (reference_id),
    INDEX idx_user_duty_shift_type (shift_type_id),
    
    -- Foreign key constraints (for referential integrity where applicable)
    CONSTRAINT fk_user_duty_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_user_duty_shift_type 
        FOREIGN KEY (shift_type_id) REFERENCES shift_types(id) ON DELETE SET NULL,
    CONSTRAINT fk_user_duty_department 
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    CONSTRAINT fk_user_duty_schedule_master 
        FOREIGN KEY (schedule_master_id) REFERENCES schedule_master(id) ON DELETE SET NULL,
    CONSTRAINT fk_user_duty_created_by 
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_user_duty_updated_by 
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
        
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Daily duty log for each user with link to duty type (without FK)';

-- Note: duty_type_id intentionally has NO foreign key constraint as requested
-- This allows for flexible duty type management without strict referential integrity

-- Insert sample data for testing (optional)
INSERT INTO user_duty (user_id, duty_date, duty_type_id, reference_id, shift_type_id, start_time, end_time, total_hours, status, department_id, schedule_master_id, is_active, created_by, updated_by) VALUES
(1, '2025-01-16', 1, 1001, 1, '08:00:00', '16:00:00', 8.00, 'completed', 1, 1, TRUE, 1, 1),
(1, '2025-01-17', 2, 2001, NULL, NULL, NULL, 8.00, 'approved', 1, 1, TRUE, 1, 1),
(2, '2025-01-16', 1, 1002, 2, '16:00:00', '24:00:00', 8.00, 'completed', 2, 1, TRUE, 1, 1),
(2, '2025-01-18', 3, 3001, NULL, '18:00:00', '22:00:00', 4.00, 'pending', 2, 1, TRUE, 1, 1)
ON DUPLICATE KEY UPDATE 
    status = VALUES(status),
    total_hours = VALUES(total_hours),
    updated_by = VALUES(updated_by),
    updated_at = CURRENT_TIMESTAMP;
