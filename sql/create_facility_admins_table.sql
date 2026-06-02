CREATE TABLE facility_admins (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary Key',
  facility_id INT NOT NULL COMMENT 'ID ของ Facility',
  user_id INT NOT NULL COMMENT 'ID ของ Partner Admin',
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'วันที่เริ่มเป็นผู้ดูแล',
  is_active TINYINT(1) DEFAULT 1 COMMENT 'สถานะการเป็นผู้ดูแล: 1 = ใช้งานอยู่, 0 = ไม่ใช้งาน',
  created_by INT DEFAULT NULL COMMENT 'ผู้สร้างข้อมูล',
  updated_by INT DEFAULT NULL COMMENT 'ผู้แก้ไขล่าสุด',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'วันที่สร้างข้อมูล',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'วันที่แก้ไขล่าสุด'
);
