CREATE TABLE facility_holidays (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary Key',
  facility_id INT NOT NULL COMMENT 'ID ของ Facility',
  holiday_date DATE NOT NULL COMMENT 'วันที่หยุด',
  name VARCHAR(255) NOT NULL COMMENT 'ชื่อวันหยุด เช่น วันปีใหม่, วันแรงงาน',
  is_recurring TINYINT(1) DEFAULT 0 COMMENT '1 = หยุดวันเดียวกันทุกปี, 0 = เฉพาะปีนั้น',
  description TEXT DEFAULT NULL COMMENT 'คำอธิบายเพิ่มเติม',
  created_by INT DEFAULT NULL COMMENT 'User ที่สร้างข้อมูล',
  updated_by INT DEFAULT NULL COMMENT 'User ที่แก้ไขล่าสุด',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'เวลาที่สร้างข้อมูล',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'เวลาที่อัปเดตล่าสุด'
);
