-- Add new fields to shift_types table
ALTER TABLE shift_types
  ADD COLUMN short_name VARCHAR(50) DEFAULT NULL COMMENT 'Abbreviated name or label of the shift type (e.g., M, E, N)',
  ADD COLUMN color_code VARCHAR(10) DEFAULT NULL COMMENT 'Color code for UI display (e.g., #FF5733)',
  ADD COLUMN total_hours DECIMAL(5,2) DEFAULT NULL COMMENT 'Total working hours of the shift (including OT)',
  ADD COLUMN normal_hours DECIMAL(5,2) DEFAULT NULL COMMENT 'Regular working hours (excluding OT)',
  ADD COLUMN ot_hours DECIMAL(5,2) DEFAULT NULL COMMENT 'Overtime hours for the shift',
  ADD COLUMN count_as_fte BOOLEAN DEFAULT TRUE COMMENT 'Whether this shift counts toward FTE calculation',
  ADD COLUMN count_as_working_hour BOOLEAN DEFAULT TRUE COMMENT 'Whether this shift counts toward total working hours',
  ADD COLUMN min_staff_weekday INT DEFAULT NULL COMMENT 'Minimum number of staff required on normal weekdays',
  ADD COLUMN max_staff_weekday INT DEFAULT NULL COMMENT 'Maximum number of staff allowed on normal weekdays',
  ADD COLUMN min_staff_weekend INT DEFAULT NULL COMMENT 'Minimum number of staff required on weekends/holidays',
  ADD COLUMN max_staff_weekend INT DEFAULT NULL COMMENT 'Maximum number of staff allowed on weekends/holidays',
  ADD COLUMN required_senior_count INT DEFAULT 0 COMMENT 'Number of senior staff required in this shift';

-- Add indexes for better performance on the new fields
CREATE INDEX idx_shift_types_short_name ON shift_types(short_name);
CREATE INDEX idx_shift_types_color_code ON shift_types(color_code);
CREATE INDEX idx_shift_types_total_hours ON shift_types(total_hours);
CREATE INDEX idx_shift_types_normal_hours ON shift_types(normal_hours);
CREATE INDEX idx_shift_types_ot_hours ON shift_types(ot_hours);
CREATE INDEX idx_shift_types_count_as_fte ON shift_types(count_as_fte);
CREATE INDEX idx_shift_types_count_as_working_hour ON shift_types(count_as_working_hour);
CREATE INDEX idx_shift_types_min_staff_weekday ON shift_types(min_staff_weekday);
CREATE INDEX idx_shift_types_max_staff_weekday ON shift_types(max_staff_weekday);
CREATE INDEX idx_shift_types_min_staff_weekend ON shift_types(min_staff_weekend);
CREATE INDEX idx_shift_types_max_staff_weekend ON shift_types(max_staff_weekend);
CREATE INDEX idx_shift_types_required_senior_count ON shift_types(required_senior_count);
