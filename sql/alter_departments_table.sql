-- Add new fields to departments table
ALTER TABLE departments
  ADD COLUMN dayoff_duedate INT DEFAULT 5 COMMENT 'Number of days in advance required for day-off request deadline',
  ADD COLUMN include_weekend TINYINT(1) DEFAULT 1 COMMENT 'Indicates whether weekends are included in the department schedule (1 = yes, 0 = no)',
  ADD COLUMN include_holiday TINYINT(1) DEFAULT 1 COMMENT 'Indicates whether holidays are included in the department schedule (1 = yes, 0 = no)';

-- Add indexes for better performance on the new fields
CREATE INDEX idx_departments_dayoff_duedate ON departments(dayoff_duedate);
CREATE INDEX idx_departments_include_weekend ON departments(include_weekend);
CREATE INDEX idx_departments_include_holiday ON departments(include_holiday);
