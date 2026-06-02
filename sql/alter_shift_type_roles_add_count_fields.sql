-- เพิ่ม min_count และ max_count columns ใน shift_type_roles table
-- สำหรับจัดการจำนวนขั้นต่ำและขั้นสูงของแต่ละ role ใน shift type

ALTER TABLE `shift_type_roles` 
ADD COLUMN `min_count` INT DEFAULT NULL COMMENT 'จำนวนขั้นต่ำของ role นี้ที่ต้องการใน shift type',
ADD COLUMN `max_count` INT DEFAULT NULL COMMENT 'จำนวนขั้นสูงของ role นี้ที่อนุญาตใน shift type';

-- เพิ่ม check constraints เพื่อให้แน่ใจว่าค่าต้องเป็นบวก
ALTER TABLE `shift_type_roles` 
ADD CONSTRAINT `chk_shift_type_roles_min_count` CHECK (`min_count` IS NULL OR `min_count` >= 0),
ADD CONSTRAINT `chk_shift_type_roles_max_count` CHECK (`max_count` IS NULL OR `max_count` >= 0),
ADD CONSTRAINT `chk_shift_type_roles_min_max` CHECK (`min_count` IS NULL OR `max_count` IS NULL OR `min_count` <= `max_count`);
