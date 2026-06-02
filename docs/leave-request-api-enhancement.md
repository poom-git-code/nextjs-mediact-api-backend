# Leave Request API Enhancement

## Overview
อัปเดต Leave Request API ให้ดึงข้อมูลที่เกี่ยวข้องมาด้วย เพื่อให้ได้ข้อมูลครบถ้วนในการแสดงผล

## Changes Made

### 1. Model Associations
เพิ่ม associations ใน `src/models/associations.ts`:

```typescript
// LeaveRequest associations
LeaveRequestModel.belongsTo(UserModel, {
  as: 'user',
  foreignKey: 'user_id',
  targetKey: 'id'
});

LeaveRequestModel.belongsTo(LeaveTypeModel, {
  as: 'leave_type',
  foreignKey: 'leave_type_id',
  targetKey: 'id'
});

// Approve user association
LeaveRequestModel.belongsTo(UserModel, {
  as: 'approve_user',
  foreignKey: 'approve_user_id',
  targetKey: 'id'
});
```

### 2. Service Updates

#### getAllLeaveRequests()
**Before:**
```typescript
export const getAllLeaveRequests = async () => {
  return await LeaveRequestModel.findAll({ order: [["created_at", "DESC"]] });
};
```

**After:**
```typescript
export const getAllLeaveRequests = async () => {
  return await LeaveRequestModel.findAll({
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: ["id", "first_name", "last_name", "email"],
        required: false,
      },
      {
        model: LeaveTypeModel,
        as: "leave_type",
        attributes: ["id", "name", "description"],
        required: false,
      },
      {
        model: UserModel,
        as: "approve_user",
        attributes: ["id", "first_name", "last_name", "email"],
        required: false,
      },
    ],
    order: [["created_at", "DESC"]],
  });
};
```

#### getLeaveRequestById()
**Before:**
```typescript
export const getLeaveRequestById = async (id: number) => {
  const leaveRequest = await LeaveRequestModel.findByPk(id);
  if (!leaveRequest) throw new Error("Leave request not found");
  return leaveRequest;
};
```

**After:**
```typescript
export const getLeaveRequestById = async (id: number) => {
  const leaveRequest = await LeaveRequestModel.findByPk(id, {
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: ["id", "first_name", "last_name", "email"],
        required: false,
      },
      {
        model: LeaveTypeModel,
        as: "leave_type",
        attributes: ["id", "name", "description"],
        required: false,
      },
      {
        model: UserModel,
        as: "approve_user",
        attributes: ["id", "first_name", "last_name", "email"],
        required: false,
      },
    ],
  });
  if (!leaveRequest) throw new Error("Leave request not found");
  return leaveRequest;
};
```

## API Response Structure

### Enhanced Response Format
```json
{
  "id": 1,
  "user_id": 123,
  "leave_type_id": 2,
  "shift_list": "morning,evening",
  "month": 12,
  "year": 2024,
  "schedule_master_id": 456,
  "leave_date": "2024-12-15",
  "start_time": "09:00:00",
  "end_time": "17:00:00",
  "status": "pending",
  "approve_user_id": 789,
  "approve_date": null,
  "remark": "Personal leave",
  "created_by": 123,
  "updated_by": null,
  "created_at": "2024-12-01T10:00:00.000Z",
  "updated_at": "2024-12-01T10:00:00.000Z",
  "user": {
    "id": 123,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com"
  },
  "leave_type": {
    "id": 2,
    "name": "Personal Leave",
    "description": "Personal time off"
  },
  "approve_user": {
    "id": 789,
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@example.com"
  }
}
```

## Related Data Included

### 1. User Information (user)
- **id**: User ID
- **first_name**: ชื่อจริง
- **last_name**: นามสกุล
- **email**: อีเมล

### 2. Leave Type Information (leave_type)
- **id**: Leave type ID
- **name**: ชื่อประเภทการลา
- **description**: คำอธิบายประเภทการลา

### 3. Approve User Information (approve_user)
- **id**: Approver user ID
- **first_name**: ชื่อจริงของผู้อนุมัติ
- **last_name**: นามสกุลของผู้อนุมัติ
- **email**: อีเมลของผู้อนุมัติ

## Benefits

### 1. Complete Data in Single Request
- ไม่จำเป็นต้องเรียก API หลายครั้ง
- ลดจำนวน network requests
- ได้ข้อมูลครบถ้วนในครั้งเดียว

### 2. Better User Experience
- แสดงชื่อผู้ใช้แทนแค่ ID
- แสดงประเภทการลาแทนแค่ ID
- แสดงข้อมูลผู้อนุมัติ

### 3. Optimized Performance
- ใช้ Sequelize includes สำหรับ JOIN queries
- ลดจำนวน database queries
- Select เฉพาะฟิลด์ที่จำเป็น

### 4. Frontend Friendly
- ข้อมูลพร้อมใช้งานทันที
- ไม่ต้องทำ data mapping เพิ่มเติม
- Structure ที่ชัดเจนและเข้าใจง่าย

## Use Cases

### 1. Leave Request List
- แสดงรายการคำขอลาพร้อมข้อมูลผู้ขอและประเภท
- Filter หรือ search ตามชื่อผู้ใช้
- แสดงสถานะการอนุมัติ

### 2. Leave Request Details
- แสดงรายละเอียดคำขอลาครบถ้วน
- ข้อมูลสำหรับการพิจารณาอนุมัติ
- History การอนุมัติ

### 3. Management Dashboard
- Overview ของคำขอลาทั้งหมด
- Report และ analytics
- การจัดการทรัพยากรบุคคล

## Technical Notes

### Association Settings
- `required: false` - ถ้าไม่มีข้อมูลจะไม่ error
- `attributes` - ระบุฟิลด์ที่ต้องการดึง
- Performance optimized queries

### Error Handling
- ยังคงมี error handling เดิม
- ถ้าหา leave request ไม่เจอจะ throw error
- Graceful handling ของข้อมูลที่ไม่มี

### Backward Compatibility
- ไม่กระทบ existing functionality
- เพิ่มข้อมูลใหม่เท่านั้น
- Client applications ที่ไม่ใช้ข้อมูลใหม่จะทำงานปกติ
