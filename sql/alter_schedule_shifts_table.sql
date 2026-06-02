-- Add new fields to schedule_shifts table
ALTER TABLE schedule_shifts
  ADD COLUMN start_time TIME DEFAULT NULL COMMENT 'Start time of the shift (snapshot from shift_types)',
  ADD COLUMN end_time TIME DEFAULT NULL COMMENT 'End time of the shift (snapshot from shift_types)',
  ADD COLUMN total_hours DECIMAL(5,2) DEFAULT NULL COMMENT 'Total hours of this shift',
  ADD COLUMN normal_hours DECIMAL(5,2) DEFAULT NULL COMMENT 'Normal working hours (excluding OT)',
  ADD COLUMN ot_hours DECIMAL(5,2) DEFAULT NULL COMMENT 'Overtime hours (if any)',
  ADD COLUMN is_overtime BOOLEAN DEFAULT FALSE COMMENT 'Flag indicating if this is an overtime shift',
  ADD COLUMN is_replacement BOOLEAN DEFAULT FALSE COMMENT 'Flag if this shift is assigned as replacement',
  ADD COLUMN replaced_employee_id INT DEFAULT NULL COMMENT 'Employee ID who was originally assigned this shift',
  ADD COLUMN actual_check_in DATETIME DEFAULT NULL COMMENT 'Actual check-in time',
  ADD COLUMN actual_check_out DATETIME DEFAULT NULL COMMENT 'Actual check-out time',
  ADD COLUMN late_minutes INT DEFAULT 0 COMMENT 'Number of minutes late to check in',
  ADD COLUMN early_leave_minutes INT DEFAULT 0 COMMENT 'Number of minutes left before shift end';

-- Add indexes for better performance on the new fields
CREATE INDEX idx_schedule_shifts_start_time ON schedule_shifts(start_time);
CREATE INDEX idx_schedule_shifts_end_time ON schedule_shifts(end_time);
CREATE INDEX idx_schedule_shifts_total_hours ON schedule_shifts(total_hours);
CREATE INDEX idx_schedule_shifts_normal_hours ON schedule_shifts(normal_hours);
CREATE INDEX idx_schedule_shifts_ot_hours ON schedule_shifts(ot_hours);
CREATE INDEX idx_schedule_shifts_is_overtime ON schedule_shifts(is_overtime);
CREATE INDEX idx_schedule_shifts_is_replacement ON schedule_shifts(is_replacement);
CREATE INDEX idx_schedule_shifts_replaced_employee_id ON schedule_shifts(replaced_employee_id);
CREATE INDEX idx_schedule_shifts_actual_check_in ON schedule_shifts(actual_check_in);
CREATE INDEX idx_schedule_shifts_actual_check_out ON schedule_shifts(actual_check_out);
CREATE INDEX idx_schedule_shifts_late_minutes ON schedule_shifts(late_minutes);
CREATE INDEX idx_schedule_shifts_early_leave_minutes ON schedule_shifts(early_leave_minutes);

-- Add foreign key constraint for replaced_employee_id
ALTER TABLE schedule_shifts
ADD CONSTRAINT fk_schedule_shifts_replaced_employee_id
FOREIGN KEY (replaced_employee_id) REFERENCES users(id);
