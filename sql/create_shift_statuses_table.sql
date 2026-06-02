-- Create shift_statuses table
CREATE TABLE shift_statuses (
  id INT NOT NULL AUTO_INCREMENT COMMENT 'Primary Key: Unique ID for each schedule status',
  name VARCHAR(50) NOT NULL COMMENT 'Name of the status (e.g., Draft, Published, Edited, Cancelled)',
  description TEXT DEFAULT NULL COMMENT 'Description of the status',
  is_active TINYINT(1) DEFAULT 1 COMMENT 'Department status: true = active, false = inactive',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when the status was created',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp when the address was last updated',
  created_by INT DEFAULT NULL COMMENT 'User ID of the creator who created this record',
  updated_by INT DEFAULT NULL COMMENT 'User ID of the last updater who updated this record',
  PRIMARY KEY (id),
  UNIQUE KEY name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table for schedule statuses';

-- Add indexes for better performance
CREATE INDEX idx_shift_statuses_name ON shift_statuses(name);
CREATE INDEX idx_shift_statuses_is_active ON shift_statuses(is_active);
CREATE INDEX idx_shift_statuses_created_by ON shift_statuses(created_by);
CREATE INDEX idx_shift_statuses_updated_by ON shift_statuses(updated_by);

-- Insert default shift statuses
INSERT INTO shift_statuses (name, description, is_active, created_by) VALUES
('Draft', 'Shift is in draft state', 1, 1),
('Scheduled', 'Shift is scheduled and confirmed', 1, 1),
('In Progress', 'Shift is currently in progress', 1, 1),
('Completed', 'Shift has been completed', 1, 1),
('Cancelled', 'Shift has been cancelled', 1, 1),
('No Show', 'Employee did not show up for shift', 1, 1),
('Late', 'Employee was late for shift', 1, 1),
('Early Leave', 'Employee left early from shift', 1, 1);
