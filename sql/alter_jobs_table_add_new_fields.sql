-- Add new fields to jobs table
-- This script adds the missing fields to match the new table structure

ALTER TABLE `jobs` 
ADD COLUMN `application_deadline` datetime DEFAULT NULL COMMENT 'Datetime when job application closes automatically' AFTER `max_applicants`,
ADD COLUMN `job_fee` decimal(10,2) DEFAULT NULL COMMENT 'Total fee paid for the job (inclusive or exclusive of VAT)' AFTER `application_deadline`,
ADD COLUMN `job_fee_vat_included` tinyint(1) DEFAULT '1' COMMENT '1 = job_fee includes VAT, 0 = excludes VAT' AFTER `job_fee`,
ADD COLUMN `auto_close_type` enum('time','first_applicant','max_applicants','manual') COLLATE utf8mb4_unicode_ci DEFAULT 'time' COMMENT 'How the job closes: by time, first applicant, max applicants, or manual' AFTER `job_fee_vat_included`;

-- Update table comment
ALTER TABLE `jobs` COMMENT = 'Table for job postings (auto or manual)';
