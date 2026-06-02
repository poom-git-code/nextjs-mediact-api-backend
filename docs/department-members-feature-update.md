# Department Members Feature Update

## Overview
เพิ่มข้อมูลสมาชิกในหน่วยงาน (Department Members) ให้กับ APIs ที่เกี่ยวข้องกับการดึงข้อมูล department

## Changes Made

### 1. Model Updates

#### DepartmentModel.ts
- เพิ่ม import `UserEmploymentModel` type
- เพิ่ม association `hasMany` กับ `UserEmploymentModel`:
  ```typescript
  DepartmentModel.hasMany(require('./UserEmploymentsModel').default, { 
    as: "department_members", 
    foreignKey: "department_id",
    sourceKey: "id" 
  });
  ```

#### UserEmploymentsModel.ts
- เพิ่ม import `UserModel`
- เพิ่ม property `user?: UserModel`
- เพิ่ม association `belongsTo` กับ `UserModel`:
  ```typescript
  UserEmploymentModel.belongsTo(UserModel, { 
    as: "user", 
    foreignKey: "user_id", 
    targetKey: "id" 
  });
  ```

### 2. Service Updates

#### departmentService.ts
อัปเดต 2 functions:

##### getPartnerDepartmentByFacility()
- เพิ่ม include `department_members` ที่ดึงข้อมูลจาก `UserEmploymentModel`
- กรองเฉพาะ `is_active: true`
- ดึงข้อมูล user ที่เกี่ยวข้อง

##### getDepartmentByIdWithDetails()
- เพิ่ม include `department_members` เช่นเดียวกัน
- ให้ response ข้อมูลครบถ้วนเหมือนกัน

### 3. API Response Enhancement

#### New Data Structure
```json
{
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
    }
  ]
}
```

## Affected APIs

### 1. GET /partner/departments/facility
- ดึงข้อมูล departments ตาม facility ของ user
- **เพิ่ม:** ข้อมูลสมาชิกทั้งหมดในแต่ละ department

### 2. GET /departments/{id}/details
- ดึงข้อมูล department ตาม ID
- **เพิ่ม:** ข้อมูลสมาชิกทั้งหมดใน department

## Data Included in department_members

### Employment Information
- **id**: User employment ID
- **user_id**: User ID
- **department_id**: Department ID
- **facility_id**: Facility ID
- **position_id**: ตำแหน่งงาน
- **start_date**: วันที่เริ่มงาน
- **end_date**: วันที่สิ้นสุดงาน (null = ยังทำงานอยู่)
- **is_active**: สถานะการทำงาน
- **created_by/updated_by**: ผู้สร้าง/อัปเดตข้อมูล
- **created_at/updated_at**: วันที่สร้าง/อัปเดต

### User Information (nested)
- **id**: User ID
- **first_name**: ชื่อ
- **last_name**: นามสกุล
- **email**: อีเมล
- **phone_number**: เบอร์โทรศัพท์
- **profile_picture**: รูปโปรไฟล์

## Filtering and Constraints

### Active Members Only
- กรองเฉพาะสมาชิกที่ `is_active: true`
- ไม่แสดงสมาชิกที่ออกจากงานแล้ว

### Required vs Optional
- `required: false` - ถ้าไม่มีสมาชิกจะไม่ error
- แสดงเป็น array ว่างแทน

## Use Cases

### 1. Team Management
- ดูรายชื่อสมาชิกทีม
- ติดต่อสมาชิกในหน่วยงาน
- จัดการบทบาทและหน้าที่

### 2. Schedule Planning
- วางแผนการทำงาน
- มอบหมายงานให้สมาชิก
- ดูจำนวนคนในแต่ละหน่วยงาน

### 3. Communication
- ติดต่อสื่อสารภายในทีม
- ส่งแจ้งเตือนให้สมาชิก
- แสดงข้อมูลผู้ใช้สำหรับ UI

### 4. Reports and Analytics
- รายงานจำนวนพนักงาน
- วิเคราะห์โครงสร้างทีม
- ติดตามการเปลี่ยนแปลงสมาชิก

## Technical Benefits

### 1. Performance
- ใช้ Sequelize includes เพื่อ optimize queries
- ลดจำนวน API calls ที่ต้องเรียก

### 2. Consistency
- ใช้ structure เดียวกันใน multiple APIs
- Reusable code patterns

### 3. Scalability
- Support การขยายข้อมูลใน future
- Flexible associations

## Migration Notes

### Backward Compatibility
- ไม่กระทบ existing API responses
- เพิ่มข้อมูลใหม่เท่านั้น
- Client applications ที่ไม่ใช้ข้อมูลใหม่จะทำงานปกติ

### Database Performance
- ใช้ proper indexing บน foreign keys
- Monitor query performance
- Consider pagination สำหรับ departments ที่มีสมาชิกเยอะ

## Testing Recommendations

### 1. Unit Tests
- Test association mappings
- Test filtering logic
- Test error handling

### 2. Integration Tests
- Test API responses
- Test performance with large datasets
- Test edge cases (empty members, inactive users)

### 3. Manual Testing
- Verify UI displays correctly
- Test with different user roles
- Validate data accuracy
