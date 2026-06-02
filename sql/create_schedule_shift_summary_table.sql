-- Create schedule_shift_summary table
-- This table stores monthly summaries of shifts by shift type per department

CREATE TABLE IF NOT EXISTS schedule_shift_summary (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary key',
    schedule_master_id INT NOT NULL COMMENT 'Reference to schedule_master.id',
    department_id INT NOT NULL COMMENT 'Department this summary belongs to',
    shift_type_id INT NOT NULL COMMENT 'Shift type (e.g., Morning, Night)',
    total_shifts INT DEFAULT 0 COMMENT 'Number of shifts in this month of this type',
    total_hours DECIMAL(10,2) DEFAULT 0 COMMENT 'Total working hours for this shift type',
    total_normal_hours DECIMAL(10,2) DEFAULT 0 COMMENT 'Total regular hours (no OT)',
    total_ot_hours DECIMAL(10,2) DEFAULT 0 COMMENT 'Total overtime hours',
    total_employees INT DEFAULT 0 COMMENT 'Number of employees scheduled for this shift type',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Is this summary active',
    created_by INT DEFAULT NULL COMMENT 'User ID who created this record',
    updated_by INT DEFAULT NULL COMMENT 'User ID who last updated this record',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record last update timestamp',
    
    -- Indexes for performance
    INDEX idx_schedule_shift_summary_schedule_master (schedule_master_id),
    INDEX idx_schedule_shift_summary_department (department_id),
    INDEX idx_schedule_shift_summary_shift_type (shift_type_id),
    INDEX idx_schedule_shift_summary_is_active (is_active),
    INDEX idx_schedule_shift_summary_created_by (created_by),
    INDEX idx_schedule_shift_summary_updated_by (updated_by),
    
    -- Unique constraint
    UNIQUE KEY uniq_summary (schedule_master_id, shift_type_id),
    
    -- Foreign key constraints
    CONSTRAINT fk_schedule_shift_summary_schedule_master 
        FOREIGN KEY (schedule_master_id) REFERENCES schedule_master(id) ON DELETE CASCADE,
    CONSTRAINT fk_schedule_shift_summary_department 
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    CONSTRAINT fk_schedule_shift_summary_shift_type 
        FOREIGN KEY (shift_type_id) REFERENCES shift_types(id) ON DELETE CASCADE,
    CONSTRAINT fk_schedule_shift_summary_created_by 
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_schedule_shift_summary_updated_by 
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
        
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Monthly summary of shifts by shift type per department';

-- Insert sample data (optional)
INSERT INTO schedule_shift_summary (
    schedule_master_id, department_id, shift_type_id, total_shifts, 
    total_hours, total_normal_hours, total_ot_hours, total_employees, 
    is_active, created_by, updated_by
) VALUES 
(1, 1, 1, 30, 240.00, 240.00, 0.00, 10, TRUE, 1, 1),
(1, 1, 2, 30, 240.00, 240.00, 0.00, 8, TRUE, 1, 1),
(1, 2, 1, 25, 200.00, 180.00, 20.00, 12, TRUE, 1, 1),
(1, 2, 2, 25, 200.00, 200.00, 0.00, 6, TRUE, 1, 1)
ON DUPLICATE KEY UPDATE 
    total_shifts = VALUES(total_shifts),
    total_hours = VALUES(total_hours),
    total_normal_hours = VALUES(total_normal_hours),
    total_ot_hours = VALUES(total_ot_hours),
    total_employees = VALUES(total_employees),
    updated_by = VALUES(updated_by),
    updated_at = CURRENT_TIMESTAMP;
