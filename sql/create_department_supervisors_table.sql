-- Create department_supervisors table
CREATE TABLE department_supervisors (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary key',
  department_id BIGINT NOT NULL COMMENT 'Reference to departments.id',
  user_id BIGINT NOT NULL COMMENT 'Reference to users.id',
  role ENUM('head', 'assistant', 'secretary') DEFAULT 'head' COMMENT 'Role of the supervisor',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether the supervisor is currently active',
  created_by BIGINT DEFAULT NULL COMMENT 'User ID of the creator',
  updated_by BIGINT DEFAULT NULL COMMENT 'User ID of the last updater',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Created timestamp',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Updated timestamp',
  
  -- Add foreign key constraints
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  
  -- Add unique constraint to prevent duplicate supervisor assignments
  UNIQUE KEY unique_active_supervisor (department_id, user_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table for department supervisors or leads';

-- Add indexes for better performance
CREATE INDEX idx_department_supervisors_department_id ON department_supervisors(department_id);
CREATE INDEX idx_department_supervisors_user_id ON department_supervisors(user_id);
CREATE INDEX idx_department_supervisors_role ON department_supervisors(role);
CREATE INDEX idx_department_supervisors_is_active ON department_supervisors(is_active);
CREATE INDEX idx_department_supervisors_created_by ON department_supervisors(created_by);
CREATE INDEX idx_department_supervisors_updated_by ON department_supervisors(updated_by);
