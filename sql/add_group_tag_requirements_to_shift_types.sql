-- เพิ่มฟิลด์ group_tag_requirements ในตาราง shift_types
ALTER TABLE shift_types 
ADD COLUMN group_tag_requirements JSON NULL COMMENT 'JSON object containing group tag requirements with min/max counts';

-- เพิ่ม index สำหรับ group_tag_requirements
-- ALTER TABLE shift_types 
-- ADD INDEX idx_shift_types_group_tag_requirements ((CAST(group_tag_requirements AS CHAR(255))));
