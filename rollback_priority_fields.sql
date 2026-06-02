-- SQL Script สำหรับ rollback (ลบ fields is_primary_group และ priority_level)
-- สำหรับตาราง shift_type_group_tags

-- ลบ index ก่อน
DROP INDEX IF EXISTS idx_shift_type_priority;

-- ลบ column is_primary_group
ALTER TABLE shift_type_group_tags 
DROP COLUMN IF EXISTS is_primary_group;

-- ลบ column priority_level
ALTER TABLE shift_type_group_tags 
DROP COLUMN IF EXISTS priority_level;
