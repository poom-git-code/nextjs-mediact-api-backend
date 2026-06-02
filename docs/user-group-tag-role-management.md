# User Group Tag Role Management API

ระบบจัดการ User Group Tag ตาม Role ที่ปรับปรุงใหม่

## 📋 Overview

ตอนนี้ User Group Tag ต้องระบุ `role_id` เป็น **required** ในการสร้าง และแต่ละ role จะมี group tag ของตัวเองแยกกัน

## 🔧 Key Changes

### 1. การสร้าง Group Tag
```json
POST /user-group-tags
{
  "name": "Senior Staff",
  "description": "กลุ่มพนักงานอาวุโส",
  "department_id": 1,
  "role_id": 2,  // ← ตอนนี้เป็น required แล้ว
  "color_code": "#FF5733"
}
```

### 2. การดึง Group Tags ตาม Role
```http
GET /user-group-tags/by-role?role_id=2
GET /user-group-tags/by-role?role_id=2&department_id=1
```

### 3. การดึง Group Tags ตาม Department และ Role
```http
GET /user-group-tags/by-department-role?department_id=1
GET /user-group-tags/by-department-role?department_id=1&role_id=2
```

## 🎯 API Endpoints

### 1. สร้าง User Group Tag (ต้องมี role_id)
**POST** `/user-group-tags`

**Request Body:**
```json
{
  "name": "Team Leader",
  "description": "กลุ่มหัวหน้าทีม", 
  "department_id": 1,
  "role_id": 3,
  "color_code": "#4CAF50"
}
```

**Response:**
```json
{
  "message": "User group tag created successfully",
  "data": {
    "id": 15,
    "name": "Team Leader",
    "description": "กลุ่มหัวหน้าทีม",
    "department_id": 1,
    "role_id": 3,
    "color_code": "#4CAF50",
    "is_active": true,
    "created_by": 1,
    "updated_by": 1
  }
}
```

### 2. ดึง Group Tags ตาม Role
**GET** `/user-group-tags/by-role?role_id={role_id}&department_id={department_id}`

**Query Parameters:**
- `role_id` (required): รหัสตำแหน่ง
- `department_id` (optional): รหัสแผนก

**Response:**
```json
{
  "message": "User group tags retrieved successfully",
  "data": [
    {
      "id": 15,
      "name": "Team Leader",
      "role_id": 3,
      "department_id": 1,
      "role": {
        "id": 3,
        "name": "Manager",
        "description": "ผู้จัดการ"
      },
      "department": {
        "id": 1,
        "name": "IT Department"
      },
      "members": [...]
    }
  ],
  "count": 1
}
```

### 3. ดึง Group Tags ตาม Department และ Role
**GET** `/user-group-tags/by-department-role?department_id={department_id}&role_id={role_id}`

**Query Parameters:**
- `department_id` (required): รหัสแผนก
- `role_id` (optional): รหัสตำแหน่ง

**Response:**
```json
{
  "message": "User group tags retrieved successfully",
  "data": [
    {
      "id": 10,
      "name": "Junior Staff",
      "role_id": 1,
      "department_id": 1,
      "role": {
        "id": 1,
        "name": "Staff",
        "description": "พนักงาน"
      }
    },
    {
      "id": 15,
      "name": "Team Leader", 
      "role_id": 3,
      "department_id": 1,
      "role": {
        "id": 3,
        "name": "Manager",
        "description": "ผู้จัดการ"
      }
    }
  ],
  "count": 2
}
```

## 🚫 Error Cases

### 1. สร้าง Group Tag โดยไม่ระบุ role_id
```json
{
  "error": "กรุณาระบุรหัสตำแหน่ง"
}
```

### 2. สร้าง Group Tag ด้วย role_id ที่ไม่มีอยู่
```json
{
  "error": "Invalid or inactive role"
}
```

### 3. สร้าง Group Tag ที่ชื่อซ้ำในแผนกและ role เดียวกัน
```json
{
  "error": "Group tag with this name already exists for this role in this department"
}
```

## 🔄 Business Rules

### 1. Role Segregation
- แต่ละ role จะมี group tag ของตัวเองแยกกัน
- Group tag ชื่อเดียวกันสามารถอยู่ในหลาย role ได้ (แต่ต้องคนละแผนก หรือคนละ role)

### 2. Unique Constraint
- ชื่อ group tag ต้องไม่ซ้ำกันภายใน role เดียวกันในแผนกเดียวกัน
- ชื่อเดียวกันสามารถใช้ใน role อื่นหรือแผนกอื่นได้

### 3. Data Integrity
- ตรวจสอบ role และ department ว่ามีอยู่จริงและ active
- Auto-validate เมื่อสร้าง group tag ใหม่

## 📊 Use Cases

### 1. แยก Group Tag ตาม Role
```http
# ดู group tags สำหรับ Staff (role_id=1)
GET /user-group-tags/by-role?role_id=1

# ดู group tags สำหรับ Manager (role_id=3) 
GET /user-group-tags/by-role?role_id=3
```

### 2. ดู Group Tag ทั้งหมดในแผนก
```http
# ดู group tags ทั้งหมดในแผนก IT
GET /user-group-tags/by-department-role?department_id=1

# ดู group tags ของ Manager ในแผนก IT
GET /user-group-tags/by-department-role?department_id=1&role_id=3
```

### 3. สร้าง Group Tag สำหรับ Role เฉพาะ
```json
POST /user-group-tags
{
  "name": "Night Shift",
  "description": "กะกลางคืน",
  "department_id": 2,
  "role_id": 1,  // Staff เท่านั้น
  "color_code": "#2196F3"
}
```

## ✅ Benefits

1. **Role-based Organization**: แต่ละ role มี group tag ของตัวเอง
2. **Better Data Structure**: ข้อมูลมีระเบียบมากขึ้น
3. **Flexible Filtering**: สามารถกรองตาม role หรือ department ได้
4. **Data Integrity**: มีการตรวจสอบความถูกต้องของข้อมูล
5. **Clear Separation**: แยกชัดเจนระหว่าง role ต่างๆ

## 🔄 Migration Notes

สำหรับข้อมูลเก่าที่มี `role_id = null`:
- ต้องกำหนด role_id ให้กับ group tag เก่า
- หรือสร้าง default role สำหรับ group tag ที่ไม่มี role
