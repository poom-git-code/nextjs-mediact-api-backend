# การแก้ไข Shift Type System สำหรับ Roles และ Group Tags

## สิ่งที่ได้ทำเสร็จแล้ว ✅

### 1. Database Schema
- ✅ สร้าง `sql/create_shift_type_roles_table.sql` สำหรับ many-to-many relationship ระหว่าง shift types และ roles
- ✅ สร้าง `sql/create_shift_type_group_tags_table.sql` สำหรับ many-to-many relationship ระหว่าง shift types และ group tags
- ✅ สร้าง `sql/add_count_fields_to_shift_type_group_tags.sql` เพื่อเพิ่ม min_count field
- ✅ สร้าง `sql/remove_group_tag_requirements_from_shift_types.sql` เพื่อลบ column เก่า

### 2. Models
- ✅ สร้าง `ShiftTypeRoleModel.ts` สำหรับจัดการ relationship ระหว่าง shift types และ roles
- ✅ สร้าง `ShiftTypeGroupTagModel.ts` สำหรับจัดการ relationship ระหว่าง shift types และ group tags พร้อม min_count
- ✅ แก้ไข `ShiftTypesModel.ts` ลบ field `group_tag_requirements` ออก

### 3. Services
- ✅ อัปเดต `shiftTypeService.ts` ให้รองรับการสร้างและอัปเดต relationships
- ✅ เพิ่มฟังก์ชัน `addRolesToShiftType`, `addGroupTagsToShiftType`, `updateShiftTypeRoles`, `updateShiftTypeGroupTags`
- ✅ อัปเดต `getShiftTypeWithRelations` เพื่อส่งกลับ `group_tag_requirements` ในรูปแบบที่ถูกต้อง
- ✅ รองรับทั้ง `min` และ `min_count` ใน group_tag_requirements สำหรับ backward compatibility

### 4. Validations
- ✅ อัปเดต `shiftTypeValidation.ts` ให้รองรับ `role_ids`, `group_tag_ids`, `allowed_roles`, `group_tags`, และ `group_tag_requirements`
- ✅ รองรับทั้ง `{ min: number }` และ `{ min_count: number }` ใน group_tag_requirements

### 5. Controllers
- ✅ อัปเดต `shiftTypeController.ts` ให้ส่งข้อมูลกลับในรูปแบบ `{ data: ... }` แทนที่จะเป็น `{ shiftType: ... }`
- ✅ แก้ไข `getShiftTypeById` ให้ใช้ `getShiftTypeWithRelations` เพื่อส่งกลับข้อมูล relationships

## สิ่งที่ต้องทำต่อ 🔧

### 1. รัน SQL Scripts
```bash
# 1. เพิ่มตารางสำหรับ relationships
mysql -u mediact_backend -p -h localhost mediact_db < sql/create_shift_type_roles_table.sql
mysql -u mediact_backend -p -h localhost mediact_db < sql/create_shift_type_group_tags_table.sql

# 2. เพิ่ม min_count field
mysql -u mediact_backend -p -h localhost mediact_db < sql/add_count_fields_to_shift_type_group_tags.sql

# 3. ลบ column เก่า (ระวัง! ข้อมูลจะหาย)
mysql -u mediact_backend -p -h localhost mediact_db < sql/remove_group_tag_requirements_from_shift_types.sql
```

### 2. ตรวจสอบ Associations
- ❗ ตรวจสอบว่าใน model index file มีการ import และ associate models ใหม่
- ❗ ตรวจสอบว่า ShiftTypeModel มี associations กับ ShiftTypeRoleModel และ ShiftTypeGroupTagModel

### 3. Test API
```bash
# ทดสอบสร้าง shift type ด้วยข้อมูลที่ส่งมา
curl -X POST http://localhost:3000/api/shift-types \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "name": "M1",
    "start_time": "08:00:00",
    "end_time": "17:00:00",
    "short_name": "M1",
    "color_code": "#B5E7A0",
    "total_hours": 9,
    "department_id": 82,
    "facility_id": 30,
    "group_tags": [11, 15, 16],
    "allowed_roles": [5, 30],
    "group_tag_requirements": {
      "11": {"min_count": 1},
      "15": {"min_count": 1},
      "16": {"min_count": 1}
    }
  }'
```

## ข้อมูลที่รองรับ

### Input Format
```json
{
  "role_ids": [1, 2],              // Array of role IDs
  "allowed_roles": [1, 2],         // Alternative field name
  "group_tag_ids": [1, 2, 3],      // Array of group tag IDs  
  "group_tags": [1, 2, 3],         // Alternative field name
  "group_tag_requirements": {
    "1": { "min": 2 },             // Preferred format
    "2": { "min_count": 1 }        // Backward compatible
  }
}
```

### Output Format
```json
{
  "shift_type_roles": [...],
  "shift_type_group_tags": [...],
  "group_tag_requirements": {
    "1": { "min": 2 },             // Only groups with requirements > 0
    "2": { "min": 1 }
  }
}
```

## หมายเหตุสำคัญ
- ระบบรองรับทั้ง `min` และ `min_count` ใน group_tag_requirements
- เฉพาะ group tags ที่มี min_count > 0 เท่านั้นที่จะปรากฏใน response
- ข้อมูลเก่าใน `shift_types.group_tag_requirements` จะหายไปเมื่อรัน SQL script ลบ column
