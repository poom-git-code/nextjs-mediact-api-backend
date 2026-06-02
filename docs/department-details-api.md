# Department Details API

## Overview
API endpoint สำหรับดึงข้อมูลรายละเอียดของ department ตาม ID โดยมีข้อมูลครบถ้วนเหมือนกับ `getPartnerDepartmentByFacility`

## Endpoint

### GET /departments/{id}/details

ดึงข้อมูลรายละเอียดของ department ตาม ID

#### Request
- **Method:** GET
- **URL:** `/departments/{id}/details`
- **Parameters:**
  - `id` (path parameter): ID ของ department ที่ต้องการดึงข้อมูล

#### Response

**Success Response (200 OK):**
```json
{
  "message": "Department retrieved successfully",
  "department": {
    "id": 10,
    "name": "Emergency Department",
    "description": "24/7 emergency medical services",
    "facility_id": 1,
    "department_type_id": 1,
    "is_active": true,
    "created_by": 1,
    "updated_by": 2,
    "created_at": "2024-01-01T09:00:00.000Z",
    "updated_at": "2024-01-15T14:30:00.000Z",
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
    "updated_by_user": {
      "id": 2,
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane.smith@example.com"
    },
    "department_operating_hours": [
      {
        "id": 1,
        "department_id": 10,
        "day_of_week": 1,
        "start_time": "00:00:00",
        "end_time": "23:59:59",
        "is_active": true,
        "created_by": 1,
        "updated_by": null,
        "created_at": "2024-01-01T09:00:00.000Z",
        "updated_at": "2024-01-01T09:00:00.000Z"
      },
      {
        "id": 2,
        "department_id": 10,
        "day_of_week": 2,
        "start_time": "00:00:00",
        "end_time": "23:59:59",
        "is_active": true,
        "created_by": 1,
        "updated_by": null,
        "created_at": "2024-01-01T09:00:00.000Z",
        "updated_at": "2024-01-01T09:00:00.000Z"
      }
    ],
    "department_supervisors": [
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
        "user": {
          "id": 5,
          "first_name": "Alice",
          "last_name": "Johnson",
          "email": "alice.johnson@example.com"
        }
      },
      {
        "id": 2,
        "department_id": 10,
        "user_id": 6,
        "role": "assistant",
        "is_active": true,
        "created_by": 1,
        "updated_by": null,
        "created_at": "2024-01-01T10:00:00.000Z",
        "updated_at": "2024-01-01T10:00:00.000Z",
        "user": {
          "id": 6,
          "first_name": "Bob",
          "last_name": "Wilson",
          "email": "bob.wilson@example.com"
        }
      }
    ],
    "shift_types": [
      {
        "id": 1,
        "name": "Morning Shift",
        "description": "06:00 - 14:00",
        "department_id": 10,
        "start_time": "06:00:00",
        "end_time": "14:00:00",
        "is_active": true,
        "created_by": 1,
        "updated_by": null,
        "created_at": "2024-01-01T09:00:00.000Z",
        "updated_at": "2024-01-01T09:00:00.000Z"
      },
      {
        "id": 2,
        "name": "Evening Shift",
        "description": "14:00 - 22:00",
        "department_id": 10,
        "start_time": "14:00:00",
        "end_time": "22:00:00",
        "is_active": true,
        "created_by": 1,
        "updated_by": null,
        "created_at": "2024-01-01T09:00:00.000Z",
        "updated_at": "2024-01-01T09:00:00.000Z"
      },
      {
        "id": 3,
        "name": "Night Shift",
        "description": "22:00 - 06:00",
        "department_id": 10,
        "start_time": "22:00:00",
        "end_time": "06:00:00",
        "is_active": true,
        "created_by": 1,
        "updated_by": null,
        "created_at": "2024-01-01T09:00:00.000Z",
        "updated_at": "2024-01-01T09:00:00.000Z"
      }
    ],
    "department_members": [
      {
        "id": 1,
        "user_id": 10,
        "department_id": 10,
        "facility_id": 1,
        "position_id": "Doctor",
        "start_date": "2024-01-01",
        "end_date": null,
        "is_active": true,
        "created_by": 1,
        "updated_by": null,
        "created_at": "2024-01-01T09:00:00.000Z",
        "updated_at": "2024-01-01T09:00:00.000Z",
        "user": {
          "id": 10,
          "first_name": "Michael",
          "last_name": "Brown",
          "email": "michael.brown@example.com",
          "phone_number": "+66812345678",
          "profile_picture": "https://example.com/profile/michael.jpg"
        }
      },
      {
        "id": 2,
        "user_id": 11,
        "department_id": 10,
        "facility_id": 1,
        "position_id": "Nurse",
        "start_date": "2024-01-01",
        "end_date": null,
        "is_active": true,
        "created_by": 1,
        "updated_by": null,
        "created_at": "2024-01-01T09:00:00.000Z",
        "updated_at": "2024-01-01T09:00:00.000Z",
        "user": {
          "id": 11,
          "first_name": "Sarah",
          "last_name": "Davis",
          "email": "sarah.davis@example.com",
          "phone_number": "+66887654321",
          "profile_picture": "https://example.com/profile/sarah.jpg"
        }
      }
    ]
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Department not found"
}
```

**Error Response (400 Bad Request - Invalid ID):**
```json
{
  "error": "Invalid department ID"
}
```

## Features

### 1. Comprehensive Department Information
API นี้จะดึงข้อมูลครบถ้วนของ department:

- **Basic Information:**
  - ID, name, description
  - facility_id, department_type_id
  - Status (is_active)
  - Created/Updated timestamps and users

- **Department Type:**
  - ข้อมูลประเภทของ department
  - ID, name, description

- **User Information:**
  - ข้อมูลผู้สร้าง (created_by_user)
  - ข้อมูลผู้อัปเดต (updated_by_user)
  - แสดงเฉพาะ id, first_name, last_name, email

### 2. Operating Hours
- **Department Operating Hours:**
  - เวลาทำการของ department ในแต่ละวัน
  - day_of_week (1-7: Monday-Sunday)
  - start_time และ end_time
  - Status (is_active)

### 3. Supervisors
- **Department Supervisors:**
  - รายการ supervisors ทั้งหมดใน department
  - Role ของแต่ละ supervisor (head, assistant, secretary)
  - ข้อมูลผู้ใช้ของแต่ละ supervisor
  - Status (is_active)

### 4. Shift Types
- **Shift Types:**
  - ประเภทของ shifts ใน department
  - ชื่อและคำอธิบาย
  - เวลาเริ่มต้นและสิ้นสุด
  - Status (is_active)

### 5. Department Members
- **Department Members:**
  - รายการสมาชิกทั้งหมดใน department
  - ข้อมูลจาก user_employment ที่ is_active = true
  - ข้อมูลผู้ใช้แต่ละคน (id, ชื่อ, อีเมล, เบอร์โทร, รูปโปรไฟล์)
  - ตำแหน่งงาน (position_id)
  - วันที่เริ่มงานและสิ้นสุด

## API Comparison

### Existing API vs New API

**Existing API:** `GET /departments/{id}`
- Response: Basic department info + department_type only
- Limited data for simple use cases

**New API:** `GET /departments/{id}/details`
- Response: Complete department info (same as `getPartnerDepartmentByFacility`)
- Full data for comprehensive use cases

## Use Cases

1. **Department Management Dashboard:**
   - แสดงข้อมูลครบถ้วนของ department
   - จัดการ supervisors และ operating hours

2. **Shift Management:**
   - ดูและจัดการ shift types
   - วางแผนการทำงาน

3. **Supervisor Management:**
   - ดูรายการ supervisors
   - จัดการบทบาทและหน้าที่

4. **Reports and Analytics:**
   - ดึงข้อมูลสำหรับรายงาน
   - วิเคราะห์ประสิทธิภาพการทำงาน

## Technical Notes

- ใช้ Sequelize ORM สำหรับ database queries
- มี associations เพื่อ optimize การดึงข้อมูล
- Error handling ที่ครอบคลุม
- Response structure ที่ชัดเจนและเข้าใจง่าย
- เหมาะสำหรับ frontend applications ที่ต้องการข้อมูลครบถ้วน
