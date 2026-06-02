# Audit Log & Trail Implementation Guide

## การติดตั้งและใช้งาน

### 1. เพิ่ม Audit Middleware ใน app.ts

```typescript
import { auditMiddleware } from './middleware/auditMiddleware';

// เพิ่มใน app.ts
app.use(auditMiddleware({
  excludePaths: ['/health', '/ping', '/favicon.ico'],
  excludeMethods: ['GET'], // ถ้าไม่ต้องการ audit GET requests
  includeRequestBody: true,
  includeResponseBody: false, // เพื่อประสิทธิภาพ
}));
```

### 2. การใช้งานใน Service

```typescript
import AuditService, { AuditActions } from '../services/auditService';

// ตัวอย่างใน departmentService.ts
export const createDepartment = async (data: any, createdByUserId: number) => {
  try {
    const newDepartment = await DepartmentModel.create({
      ...data,
      created_by: createdByUserId,
    });

    // บันทึก audit log
    await AuditService.log({
      userId: createdByUserId,
      action: AuditActions.CREATE,
      tableName: 'departments',
      recordId: newDepartment.id,
      newValues: newDepartment.toJSON(),
    });

    return newDepartment;
  } catch (error: any) {
    await AuditService.log({
      userId: createdByUserId,
      action: 'CREATE_DEPARTMENT_ERROR',
      tableName: 'departments',
      oldValues: { error: error.message },
    });
    throw error;
  }
};

export const updateDepartment = async (
  id: number, 
  updates: any, 
  updatedBy: number
) => {
  try {
    // หา old values
    const oldDepartment = await DepartmentModel.findByPk(id);
    const oldValues = oldDepartment?.toJSON();

    // update
    await oldDepartment?.update(updates);
    const newValues = oldDepartment?.toJSON();

    // audit log
    await AuditService.log({
      userId: updatedBy,
      action: AuditActions.UPDATE,
      tableName: 'departments',
      recordId: id,
      oldValues,
      newValues,
      changes: AuditService.calculateChanges(oldValues, newValues),
    });

    return oldDepartment;
  } catch (error: any) {
    await AuditService.log({
      userId: updatedBy,
      action: 'UPDATE_DEPARTMENT_ERROR',
      tableName: 'departments',
      recordId: id,
      oldValues: { error: error.message },
    });
    throw error;
  }
};
```

### 3. การเรียกดู Audit Logs

```bash
# ดู audit logs ทั้งหมด
GET /api/audit/logs?page=1&limit=50

# ดู audit logs ของ user เฉพาะ
GET /api/audit/user/123

# ดู audit trail ของ record เฉพาะ
GET /api/audit/trail/departments/456

# กรองตามวันที่
GET /api/audit/logs?startDate=2025-01-01&endDate=2025-01-31

# กรองตาม action
GET /api/audit/logs?action=CREATE&tableName=departments
```

### 4. ข้อมูลที่จะถูกบันทึก

- **user_id**: ผู้ที่ทำการกระทำ
- **action**: การกระทำ (CREATE, UPDATE, DELETE, LOGIN, etc.)
- **table_name**: ตารางที่ถูกกระทำ
- **record_id**: ID ของ record ที่ถูกกระทำ
- **old_values**: ค่าเดิมก่อนการเปลี่ยนแปลง
- **new_values**: ค่าใหม่หลังการเปลี่ยนแปลง
- **changes**: การเปลี่ยนแปลงที่เกิดขึ้น
- **ip_address**: IP ของผู้ใช้
- **user_agent**: Browser/App ที่ใช้
- **request_url**: URL ที่เรียก
- **request_method**: HTTP method
- **status_code**: HTTP status code
- **created_at**: เวลาที่เกิดเหตุการณ์

### 5. การใช้งานสำหรับ Actions ต่าง ๆ

```typescript
// User login
await AuditService.log({
  userId: user.id,
  action: AuditActions.LOGIN,
  tableName: 'users',
  recordId: user.id,
});

// User logout
await AuditService.log({
  userId: user.id,
  action: AuditActions.LOGOUT,
  tableName: 'users',
  recordId: user.id,
});

// View sensitive data
await AuditService.log({
  userId: currentUser.id,
  action: AuditActions.VIEW,
  tableName: 'user_salaries',
  recordId: salaryRecord.id,
});

// Export data
await AuditService.log({
  userId: currentUser.id,
  action: AuditActions.EXPORT,
  tableName: 'reports',
  newValues: { exportType: 'PDF', recordCount: 100 },
});

// Approve/Reject
await AuditService.log({
  userId: approver.id,
  action: AuditActions.APPROVE,
  tableName: 'leave_requests',
  recordId: leaveRequest.id,
  changes: { status: { from: 'pending', to: 'approved' } },
});
```

### 6. การ Query Audit Logs ขั้นสูง

```typescript
// หา actions ทั้งหมดของ user ใน 30 วันที่แล้ว
const userActions = await AuditService.getAuditLogs({
  userId: 123,
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  limit: 100,
});

// หา changes ทั้งหมดของ department เฉพาะ
const departmentChanges = await AuditService.getAuditLogs({
  tableName: 'departments',
  recordId: 456,
  action: 'UPDATE',
});

// หา login attempts ที่ล้มเหลว
const failedLogins = await AuditService.getAuditLogs({
  action: 'LOGIN_ERROR',
  tableName: 'users',
});
```

### 7. Performance Considerations

1. **Indexing**: ตาราง audit_logs มี indexes ที่จำเป็น
2. **Archiving**: ควรย้ายข้อมูลเก่าออกเป็นระยะ ๆ
3. **Async Logging**: Audit logging ไม่ควรทำให้ business logic ช้าลง
4. **Selective Auditing**: ไม่จำเป็นต้อง audit ทุก GET request

### 8. Security Features

- IP tracking
- User agent logging  
- Request URL และ method
- Error logging
- Failed access attempts
- Data export tracking

## Benefits

✅ **Compliance**: ตรวจสอบได้ว่าใครทำอะไรเมื่อไหร่  
✅ **Security**: ติดตาม unauthorized access  
✅ **Debugging**: ช่วยหาสาเหตุของปัญหา  
✅ **Analytics**: วิเคราะห์การใช้งานระบบ  
✅ **Legal**: หลักฐานทางกฎหมาย
