-- ลบ column group_tag_requirements จากตาราง shift_types
-- เพราะเราได้ย้ายข้อมูลไปเก็บใน shift_type_group_tags แล้ว
ALTER TABLE shift_types 
DROP COLUMN group_tag_requirements;
