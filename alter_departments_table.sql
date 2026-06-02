-- ALTER TABLE script for departments table
-- Add missing fields based on current database schema
-- Date: October 3, 2025

USE mediact_db; -- Replace with your actual database name

-- Current columns in departments table (from database):
-- 1. id (int) - Primary Key
-- 2. name (varchar(255))
-- 3. abbreviation (varchar(50)) - ✅ EXISTS
-- 4. type_id (int)
-- 5. facility_id (int)
-- 6. parent_department_id (int)
-- 7. is_active (tinyint(1))
-- 8. created_by (int)
-- 9. updated_by (int)
-- 10. created_at (datetime)
-- 11. updated_at (datetime)
-- 12. dayoff_duedate (int)
-- 13. dayoff_start_date (date) - ✅ EXISTS
-- 14. dayoff_end_date (date) - ✅ EXISTS
-- 15. dayoff_start_time (time) - ✅ EXISTS
-- 16. dayoff_end_time (time) - ✅ EXISTS
-- 17. schedule_announcement_date (date) - ✅ EXISTS
-- 18. include_weekend (tinyint(1))
-- 19. include_holiday (tinyint(1))
-- 20. role_tags (varchar(100))
-- 21. is_default (tinyint(1))

-- Add missing columns that API needs (only columns that don't exist yet)

-- Add schedule_announcement_time column after schedule_announcement_date
ALTER TABLE departments 
ADD COLUMN schedule_announcement_time TIME NULL COMMENT 'Time for schedule announcement (HH:MM format)' AFTER schedule_announcement_date,
ADD COLUMN day_off_submission_start_date INT NULL COMMENT 'Number of days in advance for day off submission start' AFTER schedule_announcement_time,
ADD COLUMN day_off_submission_start_time TIME NULL COMMENT 'Start time for day off submission (HH:MM format)' AFTER day_off_submission_start_date,
ADD COLUMN day_off_submission_end_date INT NULL COMMENT 'Number of days in advance for day off submission end' AFTER day_off_submission_start_time,
ADD COLUMN day_off_submission_end_time TIME NULL COMMENT 'End time for day off submission (HH:MM format)' AFTER day_off_submission_end_date;

-- Verify the table structure after changes
DESCRIBE departments;

-- Show sample data with all columns (including existing ones)
SELECT 
    id,
    name,
    abbreviation, -- EXISTS
    type_id,
    facility_id,
    dayoff_duedate,
    dayoff_start_date, -- EXISTS
    dayoff_end_date, -- EXISTS
    dayoff_start_time, -- EXISTS
    dayoff_end_time, -- EXISTS
    schedule_announcement_date, -- EXISTS (but as DATE, API needs INT)
    schedule_announcement_time, -- NEW
    day_off_submission_start_date, -- NEW
    day_off_submission_start_time, -- NEW
    day_off_submission_end_date, -- NEW
    day_off_submission_end_time, -- NEW
    include_weekend,
    include_holiday,
    role_tags,
    is_active,
    created_at
FROM departments 
LIMIT 5;

-- Test update with new fields (example)
-- UPDATE departments 
-- SET abbreviation = 'OR', 
--     schedule_announcement_time = '08:00',
--     day_off_submission_start_date = 1,
--     day_off_submission_start_time = '08:00',
--     day_off_submission_end_date = 5,
--     day_off_submission_end_time = '16:00'
-- WHERE id = 27;

-- Note: schedule_announcement_date already exists as DATE type
-- If API needs INT type instead, use this query to convert:
-- ALTER TABLE departments MODIFY COLUMN schedule_announcement_date INT NULL;