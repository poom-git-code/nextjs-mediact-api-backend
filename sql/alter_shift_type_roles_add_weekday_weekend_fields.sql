-- เพิ่ม min_count_weekday, max_count_weekday, min_count_weekend, max_count_weekend columns 
-- ใน shift_type_roles table สำหรับจัดการจำนวนขั้นต่ำและขั้นสูงแยกตามวันธรรมดาและวันหยุด

ALTER TABLE `shift_type_roles` 
ADD COLUMN `min_count_weekday` INT DEFAULT NULL COMMENT 'จำนวนขั้นต่ำของ role นี้ที่ต้องการในวันธรรมดา',
ADD COLUMN `max_count_weekday` INT DEFAULT NULL COMMENT 'จำนวนขั้นสูงของ role นี้ที่อนุญาตในวันธรรมดา',
ADD COLUMN `min_count_weekend` INT DEFAULT NULL COMMENT 'จำนวนขั้นต่ำของ role นี้ที่ต้องการในวันหยุด',
ADD COLUMN `max_count_weekend` INT DEFAULT NULL COMMENT 'จำนวนขั้นสูงของ role นี้ที่อนุญาตในวันหยุด';

-- เพิ่ม check constraints เพื่อให้แน่ใจว่าค่าต้องเป็นบวก
ALTER TABLE `shift_type_roles` 
ADD CONSTRAINT `chk_shift_type_roles_min_count_weekday` CHECK (`min_count_weekday` IS NULL OR `min_count_weekday` >= 0),
ADD CONSTRAINT `chk_shift_type_roles_max_count_weekday` CHECK (`max_count_weekday` IS NULL OR `max_count_weekday` >= 0),
ADD CONSTRAINT `chk_shift_type_roles_min_count_weekend` CHECK (`min_count_weekend` IS NULL OR `min_count_weekend` >= 0),
ADD CONSTRAINT `chk_shift_type_roles_max_count_weekend` CHECK (`max_count_weekend` IS NULL OR `max_count_weekend` >= 0),
ADD CONSTRAINT `chk_shift_type_roles_min_max_weekday` CHECK (`min_count_weekday` IS NULL OR `max_count_weekday` IS NULL OR `min_count_weekday` <= `max_count_weekday`),
ADD CONSTRAINT `chk_shift_type_roles_min_max_weekend` CHECK (`min_count_weekend` IS NULL OR `max_count_weekend` IS NULL OR `min_count_weekend` <= `max_count_weekend`);
