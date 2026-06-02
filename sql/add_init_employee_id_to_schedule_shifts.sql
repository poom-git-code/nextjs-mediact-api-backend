-- Add init_employee_id field to schedule_shifts table
-- This field stores the original employee ID assigned to the shift

ALTER TABLE `schedule_shifts` 
ADD COLUMN `init_employee_id` int NOT NULL DEFAULT '0' COMMENT 'Original employee ID assigned to this shift' 
AFTER `early_leave_minutes`;

-- Optional: Update existing records to set init_employee_id same as employee_id
-- UPDATE `schedule_shifts` SET `init_employee_id` = `employee_id` WHERE `init_employee_id` = 0;
