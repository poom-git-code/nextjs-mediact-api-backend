-- Add new fields to schedule_master table
ALTER TABLE schedule_master
  ADD COLUMN department_name VARCHAR(255) DEFAULT NULL COMMENT 'Name of the department for redundancy/reporting',
  ADD COLUMN total_working_days INT DEFAULT NULL COMMENT 'Total number of working days in the month',
  ADD COLUMN working_hours_per_person DECIMAL(6,2) DEFAULT NULL COMMENT 'Planned working hours per person in this month',
  ADD COLUMN total_dayoffs INT DEFAULT NULL COMMENT 'Total number of day-offs for the month (days not scheduled)',
  ADD COLUMN total_holidays INT DEFAULT NULL COMMENT 'Total number of official holidays in the month',
  ADD COLUMN total_fte DECIMAL(6,2) DEFAULT NULL COMMENT 'Total calculated FTE for the schedule',
  ADD COLUMN total_shifts_needed INT DEFAULT NULL COMMENT 'Total number of shifts needed for the department in the month',
  ADD COLUMN total_working_hours_required DECIMAL(10,2) DEFAULT NULL COMMENT 'Total working hours required for the department in the month',
  ADD COLUMN total_members INT DEFAULT NULL COMMENT 'Total number of assigned staff in the department',
  ADD COLUMN total_regular_hours_available DECIMAL(10,2) DEFAULT NULL COMMENT 'Sum of normal hours all members can contribute',
  ADD COLUMN total_ot_hours_required DECIMAL(10,2) DEFAULT NULL COMMENT 'Estimated overtime hours needed to cover gap',
  ADD COLUMN additional_members_required INT DEFAULT NULL COMMENT 'Estimated number of extra members needed to meet coverage';

-- Add indexes for better performance on the new fields
CREATE INDEX idx_schedule_master_department_name ON schedule_master(department_name);
CREATE INDEX idx_schedule_master_total_working_days ON schedule_master(total_working_days);
CREATE INDEX idx_schedule_master_working_hours_per_person ON schedule_master(working_hours_per_person);
CREATE INDEX idx_schedule_master_total_dayoffs ON schedule_master(total_dayoffs);
CREATE INDEX idx_schedule_master_total_holidays ON schedule_master(total_holidays);
CREATE INDEX idx_schedule_master_total_fte ON schedule_master(total_fte);
CREATE INDEX idx_schedule_master_total_shifts_needed ON schedule_master(total_shifts_needed);
CREATE INDEX idx_schedule_master_total_working_hours_required ON schedule_master(total_working_hours_required);
CREATE INDEX idx_schedule_master_total_members ON schedule_master(total_members);
CREATE INDEX idx_schedule_master_total_regular_hours_available ON schedule_master(total_regular_hours_available);
CREATE INDEX idx_schedule_master_total_ot_hours_required ON schedule_master(total_ot_hours_required);
CREATE INDEX idx_schedule_master_additional_members_required ON schedule_master(additional_members_required);
