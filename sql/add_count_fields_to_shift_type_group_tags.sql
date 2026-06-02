-- เพิ่มฟิลด์ min_count ในตาราง shift_type_group_tags
-- โดย min_count = 0 หมายถึงไม่มีข้อจำกัด, > 0 หมายถึงจำเป็นต้องมีอย่างน้อยตามจำนวนที่กำหนด
ALTER TABLE shift_type_group_tags 
ADD COLUMN min_count INT DEFAULT 0 NOT NULL COMMENT 'Minimum required count for this group tag (0 = no requirement)';

-- เพิ่ม check constraint เพื่อให้แน่ใจว่า min_count >= 0
ALTER TABLE shift_type_group_tags 
ADD CONSTRAINT chk_shift_type_group_tags_min_count_valid 
CHECK (min_count >= 0);
