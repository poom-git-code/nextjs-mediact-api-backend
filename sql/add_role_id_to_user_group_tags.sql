-- เพิ่ม role_id ในตาราง user_group_tags เพื่อให้ group tag มี role กำกับ
ALTER TABLE user_group_tags 
ADD COLUMN role_id INT NULL COMMENT 'Role that governs this group tag' AFTER department_id;

-- เพิ่ม foreign key constraint
ALTER TABLE user_group_tags 
ADD CONSTRAINT fk_user_group_tags_role_id 
FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- เพิ่ม index สำหรับ performance
CREATE INDEX idx_user_group_tags_role_id ON user_group_tags(role_id);
