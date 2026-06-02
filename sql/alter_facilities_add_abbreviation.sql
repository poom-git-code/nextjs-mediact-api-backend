-- เพิ่ม field abbreviation ใน table facilities
ALTER TABLE facilities
ADD COLUMN abbreviation VARCHAR(50) DEFAULT NULL COMMENT 'ตัวย่อของสถานพยาบาล เช่น PYT2, BDMS';

-- เพิ่ม unique constraint สำหรับ abbreviation (อนุญาตให้เป็น null ได้)
ALTER TABLE facilities
ADD CONSTRAINT uk_facilities_abbreviation UNIQUE (abbreviation);

-- เพิ่ม unique constraint สำหรับ name (ชื่อสถานพยาบาลต้องไม่ซ้ำ)
ALTER TABLE facilities
ADD CONSTRAINT uk_facilities_name UNIQUE (name);
