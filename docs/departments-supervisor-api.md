# Department Supervisor API

## Overview
API endpoint สำหรับดึงข้อมูล list ของ department ที่ user สามารถดูได้ทั้งหมด โดยหา user ID จาก token และดึงข้อมูลจาก department_supervisor พร้อมข้อมูลของตัว department ด้วย

## Endpoint

### GET /departments/supervisor

ดึงข้อมูล departments ที่ user เป็น supervisor

#### Request
- **Method:** GET
- **URL:** `/departments/supervisor`
- **Authentication:** Bearer Token (JWT)
- **Headers:**
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```

#### Response

**Success Response (200 OK):**
```json
{
  "message": "Departments retrieved successfully",
  "departments": [
    {
      "id": 1,
      "department_id": 10,
      "user_id": 5,
      "role": "head",
      "is_active": true,
      "created_by": 1,
      "updated_by": null,
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T10:00:00.000Z",
      "department": {
        "id": 10,
        "name": "Emergency Department",
        "description": "24/7 emergency medical services",
        "facility_id": 1,
        "department_type_id": 1,
        "is_active": true,
        "created_by": 1,
        "updated_by": null,
        "created_at": "2024-01-01T09:00:00.000Z",
        "updated_at": "2024-01-01T09:00:00.000Z",
        "type": {
          "id": 1,
          "name": "Emergency",
          "description": "Emergency medical department"
        },
        "created_by_user": {
          "id": 1,
          "first_name": "John",
          "last_name": "Doe",
          "email": "john.doe@example.com"
        },
        "updated_by_user": null,
        "department_operating_hours": [
          {
            "id": 1,
            "department_id": 10,
            "day_of_week": 1,
            "start_time": "00:00:00",
            "end_time": "23:59:59",
            "is_active": true
          }
        ],
        "department_supervisors": [
          {
            "id": 1,
            "department_id": 10,
            "user_id": 5,
            "role": "head",
            "is_active": true,
            "user": {
              "id": 5,
              "first_name": "Jane",
              "last_name": "Smith",
              "email": "jane.smith@example.com"
            }
          }
        ],
        "shift_types": [
          {
            "id": 1,
            "name": "Morning Shift",
            "description": "06:00 - 14:00",
            "department_id": 10
          }
        ]
      },
      "user": {
        "id": 5,
        "first_name": "Jane",
        "last_name": "Smith",
        "email": "jane.smith@example.com"
      }
    }
  ]
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "No departments found for this supervisor"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized access"
}
```

## Features

### 1. Authentication
- ใช้ JWT token ในการยืนยันตัวตน
- ดึง user ID จาก token โดยอัตโนมัติ

### 2. Data Filtering
- ดึงเฉพาะ departments ที่ user เป็น supervisor
- กรองเฉพาะ supervisor records ที่ `is_active = true`

### 3. Related Data
API นี้จะดึงข้อมูลที่เกี่ยวข้องทั้งหมด:

- **Department Information:**
  - ข้อมูลพื้นฐานของ department
  - ประเภทของ department (type)
  - ผู้สร้างและผู้อัปเดต department
  
- **Operating Hours:**
  - เวลาทำการของ department
  
- **All Supervisors:**
  - รายการ supervisor ทั้งหมดใน department
  - ข้อมูลผู้ใช้ของแต่ละ supervisor
  
- **Shift Types:**
  - ประเภทของ shifts ใน department

### 4. Supervisor Role Information
- ข้อมูลตำแหน่งของ supervisor (head, assistant, secretary)
- ข้อมูลผู้ใช้ที่เป็น supervisor

## Use Cases

1. **Dashboard Display:** แสดงรายการ departments ที่ user มีสิทธิ์ดูแล
2. **Supervisor Management:** จัดการข้อมูล departments ที่ user เป็น supervisor
3. **Department Overview:** ดูข้อมูลโดยรวมของ departments ที่รับผิดชอบ
4. **Shift Management:** ดูและจัดการ shift types ใน departments ที่ดูแล

## Technical Notes

- ใช้ Sequelize ORM สำหรับ database queries
- มี error handling ที่ครอบคลุม
- ใช้ associations เพื่อ optimize การดึงข้อมูล
- Response มีโครงสร้างที่ชัดเจนและเข้าใจง่าย
