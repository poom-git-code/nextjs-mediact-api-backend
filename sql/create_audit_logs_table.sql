-- สร้างตาราง audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'รหัสประจำ audit log (เพิ่มอัตโนมัติ)',
  user_id INT NULL COMMENT 'รหัสผู้ใช้ที่ทำการกระทำ (FK จาก users.id)',
  action VARCHAR(100) NOT NULL COMMENT 'การกระทำที่เกิดขึ้น เช่น CREATE, UPDATE, DELETE, LOGIN, API_CREATE',
  table_name VARCHAR(100) NOT NULL COMMENT 'ชื่อตารางที่ถูกกระทำ เช่น users, departments, facilities',
  record_id INT NULL COMMENT 'รหัสของ record ที่ถูกกระทำ (Primary Key ของตารางนั้น)',
  old_values JSON NULL COMMENT 'ข้อมูลเดิมก่อนการเปลี่ยนแปลง (สำหรับ UPDATE/DELETE)',
  new_values JSON NULL COMMENT 'ข้อมูลใหม่หลังการเปลี่ยนแปลง (สำหรับ CREATE/UPDATE)',
  changes JSON NULL COMMENT 'รายละเอียดการเปลี่ยนแปลง field ใดบ้าง และเปลี่ยนจากอะไรเป็นอะไร',
  ip_address VARCHAR(45) NULL COMMENT 'IP Address ของผู้ใช้ (รองรับ IPv4 และ IPv6)',
  user_agent TEXT NULL COMMENT 'ข้อมูล Browser/Application ที่ใช้เข้าถึงระบบ',
  request_url VARCHAR(500) NULL COMMENT 'URL ที่ถูกเรียก เช่น /api/users/123',
  request_method VARCHAR(10) NULL COMMENT 'HTTP Method ที่ใช้ เช่น GET, POST, PUT, DELETE',
  status_code INT NULL COMMENT 'HTTP Status Code ที่ส่งกลับ เช่น 200, 404, 500',
  session_id VARCHAR(255) NULL COMMENT 'Session ID สำหรับการติดตาม session ของผู้ใช้',
  transaction_id VARCHAR(255) NULL COMMENT 'Transaction ID สำหรับการจัดกลุ่ม operations ที่เกี่ยวข้องกัน',
  auto_audit BOOLEAN DEFAULT TRUE COMMENT 'บอกว่าเป็น audit ที่เกิดจาก middleware อัตโนมัติ หรือ manual logging',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'วันเวลาที่เกิดการกระทำ',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'วันเวลาที่อัพเดท record นี้ล่าสุด',
  INDEX idx_user_id (user_id) COMMENT 'Index สำหรับค้นหาด้วย user_id',
  INDEX idx_action (action) COMMENT 'Index สำหรับค้นหาด้วย action',
  INDEX idx_table_name (table_name) COMMENT 'Index สำหรับค้นหาด้วย table_name',
  INDEX idx_record_id (record_id) COMMENT 'Index สำหรับค้นหาด้วย record_id',
  INDEX idx_created_at (created_at) COMMENT 'Index สำหรับค้นหาด้วยช่วงเวลา',
  INDEX idx_auto_audit (auto_audit) COMMENT 'Index สำหรับแยก auto vs manual audit',
  INDEX idx_session_id (session_id) COMMENT 'Index สำหรับติดตาม session',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) COMMENT = 'ตารางเก็บประวัติการใช้งานระบบทั้งหมด (Audit Trail)';

-- สร้างตาราง audit_settings สำหรับควบคุม auto audit
CREATE TABLE IF NOT EXISTS audit_settings (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'รหัสประจำการตั้งค่า audit',
  table_name VARCHAR(100) NOT NULL UNIQUE COMMENT 'ชื่อตารางที่ต้องการตั้งค่า audit เช่น users, departments',
  auto_audit_enabled BOOLEAN DEFAULT TRUE COMMENT 'เปิด/ปิดการ audit อัตโนมัติสำหรับตารางนี้',
  track_select BOOLEAN DEFAULT FALSE COMMENT 'เก็บ log การอ่านข้อมูล (SELECT/GET) หรือไม่',
  track_insert BOOLEAN DEFAULT TRUE COMMENT 'เก็บ log การสร้างข้อมูลใหม่ (INSERT/POST) หรือไม่',
  track_update BOOLEAN DEFAULT TRUE COMMENT 'เก็บ log การแก้ไขข้อมูล (UPDATE/PUT/PATCH) หรือไม่',
  track_delete BOOLEAN DEFAULT TRUE COMMENT 'เก็บ log การลบข้อมูล (DELETE) หรือไม่',
  exclude_columns JSON NULL COMMENT 'รายชื่อคอลัมน์ที่ไม่ต้องการเก็บใน audit log เช่น ["password", "token"]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'วันเวลาที่สร้างการตั้งค่านี้',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'วันเวลาที่แก้ไขการตั้งค่าล่าสุด',
  INDEX idx_table_name (table_name) COMMENT 'Index สำหรับค้นหาด้วยชื่อตาราง',
  INDEX idx_auto_audit_enabled (auto_audit_enabled) COMMENT 'Index สำหรับค้นหาตารางที่เปิด auto audit'
) COMMENT = 'ตารางการตั้งค่าการ audit สำหรับแต่ละตาราง';

-- Insert default audit settings สำหรับตารางหลัก
INSERT INTO audit_settings (table_name, auto_audit_enabled, track_select, track_insert, track_update, track_delete, exclude_columns) VALUES
('users', TRUE, FALSE, TRUE, TRUE, TRUE, '["password", "remember_token"]') /* ตาราง users - ไม่เก็บ password */,
('departments', TRUE, FALSE, TRUE, TRUE, TRUE, NULL) /* ตาราง departments - เก็บครบทุก field */,
('facilities', TRUE, FALSE, TRUE, TRUE, TRUE, NULL) /* ตาราง facilities - เก็บครบทุก field */,
('schedule_shifts', TRUE, FALSE, TRUE, TRUE, TRUE, NULL) /* ตาราง schedule_shifts - เก็บครบทุก field */,
('schedule_master', TRUE, FALSE, TRUE, TRUE, TRUE, NULL) /* ตาราง schedule_master - เก็บครบทุก field */,
('user_roles', TRUE, FALSE, TRUE, TRUE, TRUE, NULL) /* ตาราง user_roles - เก็บครบทุก field */,
('user_employment', TRUE, FALSE, TRUE, TRUE, TRUE, NULL) /* ตาราง user_employment - เก็บครบทุก field */,
('leave_requests', TRUE, FALSE, TRUE, TRUE, TRUE, NULL) /* ตาราง leave_requests - เก็บครบทุก field */,
('swap_requests', TRUE, FALSE, TRUE, TRUE, TRUE, NULL) /* ตาราง swap_requests - เก็บครบทุก field */;

-- สร้าง stored procedure สำหรับ auto audit
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS CreateAuditLog(
  IN p_user_id INT,                    /* รหัสผู้ใช้ที่ทำการกระทำ */
  IN p_action VARCHAR(100),            /* การกระทำ เช่น CREATE, UPDATE, DELETE */
  IN p_table_name VARCHAR(100),        /* ชื่อตารางที่ถูกกระทำ */
  IN p_record_id INT,                  /* รหัส record ที่ถูกกระทำ */
  IN p_old_values JSON,                /* ข้อมูลเดิมก่อนการเปลี่ยนแปลง */
  IN p_new_values JSON,                /* ข้อมูลใหม่หลังการเปลี่ยนแปลง */
  IN p_session_id VARCHAR(255),        /* Session ID ของผู้ใช้ */
  IN p_transaction_id VARCHAR(255)     /* Transaction ID สำหรับ group operations */
)
COMMENT 'Stored Procedure สำหรับบันทึก audit log อัตโนมัติ โดยตรวจสอบการตั้งค่าก่อน'
BEGIN
  DECLARE audit_enabled BOOLEAN DEFAULT TRUE;
  
  -- ตรวจสอบว่าตารางนี้เปิด auto audit หรือไม่
  SELECT auto_audit_enabled INTO audit_enabled 
  FROM audit_settings 
  WHERE table_name = p_table_name;
  
  -- ถ้าเปิด auto audit ให้บันทึก log
  IF audit_enabled THEN
    INSERT INTO audit_logs (
      user_id, 
      action, 
      table_name, 
      record_id, 
      old_values, 
      new_values, 
      changes,
      session_id,
      transaction_id,
      auto_audit
    ) VALUES (
      p_user_id,
      p_action,
      p_table_name,
      p_record_id,
      p_old_values,
      p_new_values,
      -- คำนวณ changes อัตโนมัติถ้ามีทั้ง old และ new values
      IF(p_old_values IS NOT NULL AND p_new_values IS NOT NULL, 
         JSON_OBJECT('changes', 'calculated_automatically'), 
         NULL),
      p_session_id,
      p_transaction_id,
      TRUE  -- auto_audit = true เพราะเรียกผ่าน stored procedure
    );
  END IF;
END //

DELIMITER ;
