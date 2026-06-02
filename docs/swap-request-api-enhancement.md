# Swap Request API Enhancement

## Overview
อัปเดต Swap Request API ให้ดึงข้อมูล user และ shift type มาด้วย เพื่อให้ได้ข้อมูลครบถ้วนในการแสดงผลคำขอสลับเวร

## Changes Made

### 1. Model Associations
เพิ่ม associations ใน `src/models/associations.ts`:

```typescript
// SwapRequest associations
SwapRequestModel.belongsTo(UserModel, {
  as: 'user',
  foreignKey: 'user_id',
  targetKey: 'id'
});

SwapRequestModel.belongsTo(ScheduleShiftModel, {
  as: 'shift',
  foreignKey: 'shift_id',
  targetKey: 'id'
});

// Approve user association for SwapRequest
SwapRequestModel.belongsTo(UserModel, {
  as: 'approve_user',
  foreignKey: 'approve_user_id',
  targetKey: 'id'
});

// ScheduleShift associations
ScheduleShiftModel.belongsTo(ShiftTypeModel, {
  as: 'shift_type',
  foreignKey: 'shift_type_id',
  targetKey: 'id'
});

ScheduleShiftModel.belongsTo(UserModel, {
  as: 'employee',
  foreignKey: 'employee_id',
  targetKey: 'id'
});
```

### 2. Service Updates

#### getAllSwapRequests()
**Before:**
```typescript
export const getAllSwapRequests = async () => {
  return await SwapRequestModel.findAll({ order: [["created_at", "DESC"]] });
};
```

**After:**
```typescript
export const getAllSwapRequests = async () => {
  return await SwapRequestModel.findAll({
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: ["id", "first_name", "last_name", "email"],
        required: false,
      },
      {
        model: ScheduleShiftModel,
        as: "shift",
        required: false,
        include: [
          {
            model: ShiftTypeModel,
            as: "shift_type",
            attributes: ["id", "name", "start_time", "end_time"],
            required: false,
          },
          {
            model: UserModel,
            as: "employee",
            attributes: ["id", "first_name", "last_name", "email"],
            required: false,
          },
        ],
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

#### getSwapRequestById()
**Before:**
```typescript
export const getSwapRequestById = async (id: number) => {
  const swapRequest = await SwapRequestModel.findByPk(id);
  if (!swapRequest) throw new Error("Swap request not found");
  return swapRequest;
};
```

**After:**
```typescript
export const getSwapRequestById = async (id: number) => {
  const swapRequest = await SwapRequestModel.findByPk(id, {
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: ["id", "first_name", "last_name", "email"],
        required: false,
      },
      {
        model: ScheduleShiftModel,
        as: "shift",
        required: false,
        include: [
          {
            model: ShiftTypeModel,
            as: "shift_type",
            attributes: ["id", "name", "start_time", "end_time"],
            required: false,
          },
          {
            model: UserModel,
            as: "employee",
            attributes: ["id", "first_name", "last_name", "email"],
            required: false,
          },
        ],
      },
      {
        model: UserModel,
        as: "approve_user",
        attributes: ["id", "first_name", "last_name", "email"],
        required: false,
      },
    ],
  });
  if (!swapRequest) throw new Error("Swap request not found");
  return swapRequest;
};
```

## API Response Structure

### Enhanced Response Format
```json
{
  "id": 1,
  "user_id": 123,
  "shift_id": 456,
  "month": 12,
  "year": 2024,
  "schedule_master_id": 789,
  "status": "pending",
  "approve_user_id": 999,
  "approve_date": null,
  "remark": "Need to swap due to personal reasons",
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
  "shift": {
    "id": 456,
    "schedule_master_id": 789,
    "shift_type_id": 2,
    "employee_id": 123,
    "facility_id": 1,
    "department_id": 10,
    "shift_date": "2024-12-15",
    "status_id": 1,
    "start_time": "09:00:00",
    "end_time": "17:00:00",
    "total_hours": 8,
    "normal_hours": 8,
    "ot_hours": 0,
    "shift_type": {
      "id": 2,
      "name": "Morning Shift",
      "start_time": "09:00:00",
      "end_time": "17:00:00"
    },
    "employee": {
      "id": 123,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com"
    }
  },
  "approve_user": {
    "id": 999,
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@example.com"
  }
}
```

## Related Data Included

### 1. User Information (user)
- **id**: User ID ของผู้ขอสลับ
- **first_name**: ชื่อจริง
- **last_name**: นามสกุล
- **email**: อีเมล

### 2. Shift Information (shift)
- **Basic Shift Data**: ข้อมูล shift ที่ต้องการสลับ
- **shift_type**: ประเภทของ shift
  - **id**: Shift type ID
  - **name**: ชื่อประเภท shift
  - **start_time**: เวลาเริ่ม
  - **end_time**: เวลาสิ้นสุด
- **employee**: ข้อมูลพนักงานที่ได้รับมอบหมาย shift

### 3. Approve User Information (approve_user)
- **id**: Approver user ID
- **first_name**: ชื่อจริงของผู้อนุมัติ
- **last_name**: นามสกุลของผู้อนุมัติ
- **email**: อีเมลของผู้อนุมัติ

## Benefits

### 1. Complete Shift Information
- ข้อมูลประเภท shift ที่ต้องการสลับ
- เวลาทำงานและรายละเอียด
- ข้อมูลพนักงานที่เกี่ยวข้อง

### 2. Better User Experience
- แสดงชื่อผู้ขอสลับแทนแค่ ID
- แสดงประเภท shift และเวลาทำงาน
- ข้อมูลผู้อนุมัติที่ชัดเจน

### 3. Enhanced Decision Making
- ข้อมูลครบถ้วนสำหรับการพิจารณา
- เห็นรายละเอียด shift ที่ต้องการสลับ
- ตรวจสอบความเหมาะสมของการสลับ

### 4. Optimized Performance
- ใช้ Sequelize includes สำหรับ JOIN queries
- ลดจำนวน API calls
- Nested includes สำหรับข้อมูลที่เกี่ยวข้อง

## Use Cases

### 1. Swap Request Management
- แสดงรายการคำขอสลับเวรพร้อมรายละเอียด
- ข้อมูลสำหรับการอนุมัติหรือปฏิเสธ
- ติดตามสถานะคำขอ

### 2. Schedule Coordination
- ดูข้อมูล shift ที่ต้องการสลับ
- ประเมินผลกระทบต่อตาราง
- จัดการทรัพยากรบุคคล

### 3. Notification System
- ส่งแจ้งเตือนพร้อมรายละเอียด
- ข้อมูลสำหรับการตัดสินใจ
- Communication ระหว่างทีม

### 4. Reporting and Analytics
- รายงานการสลับเวร
- วิเคราะห์ patterns
- ประเมินประสิทธิภาพ

## Technical Notes

### Association Chain
```
SwapRequest -> User (ผู้ขอสลับ)
SwapRequest -> ScheduleShift -> ShiftType (ประเภท shift)
SwapRequest -> ScheduleShift -> Employee (พนักงานที่ได้รับมอบหมาย)
SwapRequest -> ApproveUser (ผู้อนุมัติ)
```

### Performance Optimization
- `required: false` สำหรับ optional associations
- `attributes` จำกัดฟิลด์ที่ดึงมา
- Proper indexing บน foreign keys

### Error Handling
- ยังคงมี error handling เดิม
- Graceful handling ของข้อมูลที่ไม่มี
- Backward compatibility

### Data Consistency
- ข้อมูลที่สอดคล้องกันใน response
- Validation ของ associations
- Proper cascade settings
