# การใช้งาน Auto Audit Middleware

## วิธีการใช้งาน

### 1. เพิ่ม Auto Audit Middleware ใน app.ts

```typescript
import { autoAuditMiddleware, AutoAuditConfigManager } from './middleware/autoAuditMiddleware';

// กำหนดค่า config (optional)
AutoAuditConfigManager.setConfig({
  enabled: true,
  excludePaths: ['/health', '/ping', '/metrics'],
  excludeMethods: ['GET'], // ข้าม GET requests
  enabledTables: ['users', 'departments', 'facilities', 'schedule_shifts'],
  trackSelectQueries: false, // ไม่ track SELECT/GET operations
  maxLogSize: 10000
});

// เพิ่ม middleware ใน app
app.use(autoAuditMiddleware({
  enabled: true,
  trackSelectQueries: false
}));

// หรือใช้แบบ default
app.use(autoAuditMiddleware());
```

### 2. ตัวอย่างการเก็บ Log อัตโนมัติ

เมื่อมี API request มา middleware จะเก็บ log ดังนี้:

```typescript
// POST /api/users
{
  "user_id": 123,
  "action": "API_CREATE",
  "table_name": "user",
  "record_id": 456,
  "old_values": {
    "request": {
      "method": "POST",
      "url": "/api/users",
      "body": { "name": "John Doe", "email": "john@example.com" },
      "userId": 123,
      "ip": "192.168.1.1"
    }
  },
  "new_values": {
    "response": {
      "status": 201,
      "body": { "id": 456, "name": "John Doe", "email": "john@example.com" },
      "duration": 250
    }
  },
  "created_at": "2025-08-30T10:00:00Z"
}
```

### 3. การจัดการ Configuration

```typescript
// เปิด/ปิด auto audit
AutoAuditConfigManager.enableAutoAudit();
AutoAuditConfigManager.disableAutoAudit();

// เพิ่ม/ลบ table ที่ต้องการ track
AutoAuditConfigManager.enableTable('new_table');
AutoAuditConfigManager.disableTable('old_table');

// ดู config ปัจจุบัน
const currentConfig = AutoAuditConfigManager.getConfig();
console.log(currentConfig);
```

### 4. Features หลัก

#### ✅ Automatic Logging
- บันทึก API requests ทั้งหมดอัตโนมัติ
- แยกแยะ HTTP methods (GET, POST, PUT, DELETE)
- เก็บ request/response data

#### ✅ Smart Filtering
- ข้าม paths ที่ไม่ต้องการ (health checks, metrics)
- ข้าม methods ที่ไม่ต้องการ (GET queries)
- ข้าม tables ที่ไม่ต้องการ track

#### ✅ Data Sanitization
- ลบ sensitive fields (password, tokens)
- จำกัดขนาด log เพื่อป้องกัน storage overflow
- ทำความสะอาด headers (authorization, cookies)

#### ✅ Error Tracking
- เก็บ log เมื่อเกิด error
- เก็บ stack trace (จำกัดขนาด)
- เก็บ error details

#### ✅ Performance Tracking
- เก็บ response time
- เก็บ IP address, User Agent
- เก็บ session/transaction ID

### 5. การ Query Auto Audit Logs

```typescript
// ดู API audit logs
const apiLogs = await AuditService.getAuditLogs({
  action: 'API_CREATE',
  tableName: 'api_request',
  userId: 123,
  startDate: new Date('2025-08-01'),
  endDate: new Date('2025-08-31')
});

// ดู logs สำหรับ specific user
const userLogs = await AuditService.getAuditLogs({
  userId: 123,
  limit: 50
});

// ดู error logs
const errorLogs = await AuditService.getAuditLogs({
  action: 'API_ERROR'
});
```

### 6. Log Data Structure

```json
{
  "id": 1,
  "user_id": 123,
  "action": "API_CREATE",
  "table_name": "user",
  "record_id": 456,
  "old_values": {
    "request": {
      "method": "POST",
      "url": "/api/users",
      "headers": { "content-type": "application/json" },
      "query": {},
      "body": { "name": "John", "email": "john@example.com" },
      "ip": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "userId": 123,
      "transactionId": "uuid-123",
      "sessionId": "session-456"
    }
  },
  "new_values": {
    "response": {
      "status": 201,
      "headers": { "content-type": "application/json" },
      "body": { "id": 456, "name": "John", "email": "john@example.com" },
      "duration": 250
    }
  },
  "changes": null,
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "request_url": "/api/users",
  "request_method": "POST",
  "status_code": 201,
  "created_at": "2025-08-30T10:00:00Z"
}
```

### 7. Best Practices

1. **เปิดใช้เฉพาะ tables ที่สำคัญ** - ลด log volume
2. **ข้าม GET requests** - เพื่อลดจำนวน logs
3. **จำกัดขนาด log** - ป้องกัน storage issues
4. **Monitor performance** - auto audit ไม่ควรกระทบต่อ API performance
5. **Regular cleanup** - ลบ logs เก่าตาม retention policy

### 8. การ Disable Auto Audit

```typescript
// ปิดการใช้งานทั้งหมด
app.use(autoAuditMiddleware({ enabled: false }));

// หรือปิดเฉพาะ table
AutoAuditConfigManager.disableTable('users');

// หรือปิดเฉพาะ GET requests
AutoAuditConfigManager.setConfig({
  excludeMethods: ['GET', 'HEAD', 'OPTIONS']
});
```

## ข้อดี

✅ **Zero Configuration** - ใช้งานได้ทันทีโดยไม่ต้องแก้ไขโค้ดเดิม  
✅ **Comprehensive Logging** - เก็บข้อมูลครบถ้วน  
✅ **Performance Optimized** - ไม่กระทบต่อ API performance  
✅ **Flexible Configuration** - ปรับแต่งได้ตามต้องการ  
✅ **Security Aware** - ลบข้อมูล sensitive อัตโนมัติ  
✅ **Error Resilient** - ไม่ให้ audit error กระทบต่อ main API
