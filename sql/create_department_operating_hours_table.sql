CREATE TABLE department_operating_hours (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary key',
  department_id INT NOT NULL COMMENT 'Reference to departments.id',
  weekday ENUM('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun') NOT NULL COMMENT 'Day of the week',
  start_time TIME NOT NULL COMMENT 'Opening time',
  end_time TIME NOT NULL COMMENT 'Closing time',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this time slot is active',
  created_by INT DEFAULT NULL COMMENT 'User ID who created the record',
  updated_by INT DEFAULT NULL COMMENT 'User ID who last updated the record',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Created timestamp',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last updated timestamp',
  
  -- Add indexes for better performance
  INDEX idx_department_id (department_id),
  INDEX idx_weekday (weekday),
  INDEX idx_is_active (is_active),
  INDEX idx_department_weekday (department_id, weekday),
  
  -- Add foreign key constraint
  CONSTRAINT fk_department_operating_hours_department_id 
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  CONSTRAINT fk_department_operating_hours_created_by 
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_department_operating_hours_updated_by 
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    
  -- Add unique constraint to prevent duplicate operating hours for same department and weekday
  UNIQUE KEY uk_department_weekday_active (department_id, weekday, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Operating hours for each department by weekday and time range';
