-- SQL Script เพิ่ม fields is_primary_group และ priority_level
-- สำหรับตาราง shift_type_group_tags

-- เพิ่ม column priority_level
ALTER TABLE shift_type_group_tags 
ADD COLUMN priority_level INTEGER NOT NULL DEFAULT 1 
COMMENT 'Priority level for shift assignment (1 = highest, higher number = lower priority)';

-- เพิ่ม column is_primary_group  
ALTER TABLE shift_type_group_tags 
ADD COLUMN is_primary_group BOOLEAN NOT NULL DEFAULT FALSE 
COMMENT 'Whether this group is the primary group for this shift type';

-- เพิ่ม index สำหรับ performance ในการ query
CREATE INDEX idx_shift_type_priority 
ON shift_type_group_tags (shift_type_id, priority_level);

-- ตัวอย่างการ update ข้อมูลเดิม (ถ้าต้องการ)
-- UPDATE shift_type_group_tags SET priority_level = 1, is_primary_group = TRUE WHERE group_tag_id = 13;
-- UPDATE shift_type_group_tags SET priority_level = 2, is_primary_group = FALSE WHERE group_tag_id = 14;
-- UPDATE shift_type_group_tags SET priority_level = 3, is_primary_group = FALSE WHERE group_tag_id = 11;
