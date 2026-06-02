# PIPEDA Compliance Implementation Guide

## 🔐 Overview

ระบบนี้ได้ถูกออกแบบเพื่อให้เป็นไปตาม **PIPEDA (Personal Information Protection and Electronic Documents Act)** ของประเทศแคนาดา โดยมีการเข้ารหัสข้อมูลส่วนบุคคลที่ละเอียดอ่อน (PII) อัตโนมัติ

## 🎯 Features

### ✅ PIPEDA Compliance
- **AES-256-GCM Encryption** สำหรับข้อมูล PII
- **SHA-256 Search Hashes** สำหรับการค้นหาข้อมูลที่เข้ารหัสแล้ว
- **Audit Trail** ครบถ้วนสำหรับการเข้าถึงข้อมูล
- **Data Retention Management** (7 ปีตาม PIPEDA)
- **Consent Tracking** การติดตามการยินยอม
- **Right to be Forgotten** การลบข้อมูลตามสิทธิ

### 🛡️ Security Features
- **Backward Compatibility** รองรับข้อมูลเก่าที่ยังไม่ได้เข้ารหัส
- **Smart Encryption** ไม่เข้ารหัสซ้ำ
- **Data Masking** สำหรับ logging
- **Safe Search** ค้นหาโดยไม่ต้อง decrypt

## 📁 File Structure

```
src/
├── services/
│   ├── pipedaEncryptionService.ts    # AES-256 encryption service
│   └── userPipedaMigrationService.ts # Migration และ compliance tools
├── controllers/
│   └── userController.ts             # อัปเดตให้รองรับ PIPEDA
├── models/
│   └── UserModel.ts                  # เพิ่ม encrypted fields
sql/
└── add_pipeda_encryption_fields.sql  # Database migration
test_pipeda_compliance.js             # Test script
```

## 🚀 Quick Start

### 1. ตั้งค่า Environment Variables

```bash
# .env file
ENCRYPTION_MASTER_KEY=your-super-secure-encryption-master-key-32-characters-long
SEARCH_SALT=your-search-salt-for-hashing-pipeda-compliance
```

⚠️ **สำคัญ**: เปลี่ยน keys เหล่านี้ในระบบ production!

### 2. รัน Database Migration

```bash
mysql -u username -p database_name < sql/add_pipeda_encryption_fields.sql
```

### 3. ทดสอบระบบ Encryption

```bash
node test_pipeda_compliance.js
```

### 4. Migration ข้อมูลเก่า

```typescript
import UserPipedaMigrationService from './src/services/userPipedaMigrationService';

// ทดสอบ encryption
await UserPipedaMigrationService.testEncryption();

// ดูสถานะปัจจุบัน
const status = await UserPipedaMigrationService.getMigrationStatus();
console.log(status);

// เริ่ม migrate ข้อมูล (ระวัง! ใช้กับข้อมูลจริง)
await UserPipedaMigrationService.migrateToEncrypted(50); // 50 users per batch
```

## 💻 การใช้งานใน Controller

### ดึงข้อมูลผู้ใช้แบบปลอดภัย

```typescript
// เดิม
const user = await UserService.getUserById(userId);
ctx.body = { user };

// ใหม่ (PIPEDA compliant)
const user = await UserService.getUserById(userId);

// Log การเข้าถึงข้อมูล sensitive
await AuditService.log({
  userId: requestingUserId,
  action: 'SENSITIVE_VIEW',
  tableName: 'users',
  recordId: userId,
  newValues: {
    sensitive_fields_accessed: ['email', 'first_name', 'phone_number'],
    reason: 'User profile view',
    ip_address: ctx.request.ip
  }
});

ctx.body = { user };
```

### การค้นหาผู้ใช้

```typescript
// ค้นหาด้วยอีเมล (รองรับทั้งข้อมูลเก่าและใหม่)
const user = await UserPipedaMigrationService.findUserByEmailSafe('test@example.com');

// ค้นหาด้วยเบอร์โทร
const user = await UserPipedaMigrationService.findUserByPhoneNumberSafe('+66812345678');

// ค้นหาด้วยเลขบัตรประชาชน
const user = await UserPipedaMigrationService.findUserByIdCardNumberSafe('1234567890123');
```

## 🔧 API Endpoints ใหม่

### PIPEDA Compliance Management

```typescript
// ลบข้อมูล PII (Right to be forgotten)
DELETE /users/:id/pii-data

// บันทึกการยินยอม
POST /users/consent

// ถอนการยินยอม
DELETE /users/consent

// ดู compliance report
GET /admin/pipeda/report
```

## 📊 Database Schema Changes

### Encrypted Fields
```sql
-- ข้อมูลที่เข้ารหัสแล้ว
email_encrypted TEXT NULL
first_name_encrypted TEXT NULL
last_name_encrypted TEXT NULL
phone_number_encrypted TEXT NULL
date_of_birth_encrypted TEXT NULL
id_card_number_encrypted TEXT NULL
passport_number_encrypted TEXT NULL
occupation_number_encrypted TEXT NULL
ID_line_encrypted TEXT NULL

-- Search hashes
email_hash VARCHAR(64) NULL
phone_number_hash VARCHAR(64) NULL
id_card_number_hash VARCHAR(64) NULL

-- Encryption metadata
is_encrypted BOOLEAN DEFAULT FALSE
encryption_version VARCHAR(10) DEFAULT 'v1.0'

-- PIPEDA compliance
data_retention_date DATE NULL
consent_given_date DATE NULL
consent_withdrawn_date DATE NULL
```

## 🔍 ตัวอย่างการใช้งาน

### 1. Encryption/Decryption

```typescript
import PipedaEncryptionService from './src/services/pipedaEncryptionService';

// เข้ารหัส
const encrypted = PipedaEncryptionService.encrypt('sensitive@email.com');
console.log(encrypted); // "a1b2c3d4e5f6..."

// ถอดรหัส
const decrypted = PipedaEncryptionService.decrypt(encrypted);
console.log(decrypted); // "sensitive@email.com"

// สร้าง search hash
const hash = PipedaEncryptionService.createSearchHash('sensitive@email.com');
console.log(hash); // "sha256_hash_string"

// สร้าง masked version
const masked = PipedaEncryptionService.createMaskedVersion('sensitive@email.com', 2);
console.log(masked); // "se******.com"
```

### 2. Compliance Reporting

```typescript
// ดูสถานะ migration
const status = await UserPipedaMigrationService.getMigrationStatus();
console.log(status);
/*
{
  total_users: 1000,
  encrypted_users: 850,
  remaining_users: 150,
  encryption_percentage: 85,
  pipeda_compliance: false
}
*/

// สร้าง compliance report
const report = await UserPipedaMigrationService.generatePipedaReport();
console.log(report);
/*
{
  report_generated_at: "2025-08-30T10:00:00.000Z",
  encryption_status: { ... },
  recommendations: [
    "Complete encryption migration for remaining 150 users"
  ],
  compliance_score: 85
}
*/
```

## ⚡ Performance Considerations

### 1. **Search Performance**
- ใช้ hash-based search แทน full table scan
- Index ทุก hash fields
- Cache search results เมื่อเป็นไปได้

### 2. **Encryption Performance**
- Smart encryption (ไม่เข้ารหัสซ้ำ)
- Batch migration (50-100 records ต่อครั้ง)
- Lazy decryption (เฉพาะเมื่อต้องการ)

### 3. **Memory Management**
- Clear sensitive data จาก memory หลังใช้งาน
- ใช้ streaming สำหรับ large datasets
- Monitor memory usage ระหว่าง migration

## 🛡️ Security Best Practices

### 1. **Key Management**
```bash
# Production keys ต้องมีความปลอดภัยสูง
ENCRYPTION_MASTER_KEY=$(openssl rand -base64 32)
SEARCH_SALT=$(openssl rand -base64 16)
```

### 2. **Access Control**
- Log ทุกการเข้าถึงข้อมูล sensitive
- Implement role-based access control
- Monitor unusual access patterns

### 3. **Data Retention**
```typescript
// ตั้งค่า data retention (7 ปีตาม PIPEDA)
const retentionDate = new Date();
retentionDate.setFullYear(retentionDate.getFullYear() + 7);

await user.update({
  data_retention_date: retentionDate
});
```

## 🚨 Migration Checklist

### Pre-Migration
- [ ] Backup ฐานข้อมูลทั้งหมด
- [ ] ทดสอบ encryption service
- [ ] ตั้งค่า environment variables
- [ ] รัน database migration script

### During Migration
- [ ] Monitor system performance
- [ ] Check migration progress
- [ ] Verify encrypted data integrity
- [ ] Test search functionality

### Post-Migration
- [ ] Verify all users encrypted
- [ ] Test application functionality
- [ ] Generate compliance report
- [ ] Update documentation

## 📋 Maintenance

### ตรวจสอบ Compliance สถานะ

```bash
# ทุกเดือน
node -e "
const service = require('./src/services/userPipedaMigrationService').default;
service.generatePipedaReport().then(console.log);
"
```

### การ Backup และ Recovery

```bash
# Backup encrypted database
mysqldump --single-transaction database_name > backup_encrypted.sql

# การ restore ต้องมี encryption keys เดิม
mysql database_name < backup_encrypted.sql
```

## 🆘 Troubleshooting

### ปัญหาที่พบบ่อย

#### 1. **Decryption ล้มเหลว**
```
Error: Decryption failed, returning original data
```
**แก้ไข**: ตรวจสอบ `ENCRYPTION_MASTER_KEY` และ `SEARCH_SALT`

#### 2. **ค้นหาไม่เจอข้อมูล**
```
User not found with email
```
**แก้ไข**: ใช้ `findUserByEmailSafe()` แทน direct query

#### 3. **Migration ล้มเหลว**
```
Failed to migrate user ID: 123
```
**แก้ไข**: ตรวจสอบ database permissions และ field lengths

## 📞 Support

สำหรับคำถามเพิ่มเติมเกี่ยวกับ PIPEDA compliance:

1. ตรวจสอบ logs ใน audit_logs table
2. รันสคริปต์ทดสอบ: `node test_pipeda_compliance.js`
3. ดู compliance report: `UserPipedaMigrationService.generatePipedaReport()`

---

## ⚖️ Legal Compliance Notes

ระบบนี้ได้ถูกออกแบบให้เป็นไปตาม PIPEDA ของแคนาดา โดยมีการ:

- ✅ เข้ารหัสข้อมูล PII ทั้งหมด
- ✅ ติดตามการเข้าถึงข้อมูล
- ✅ รองรับ Right to be forgotten
- ✅ จัดการ data retention
- ✅ ติดตาม consent management

**หมายเหตุ**: คำแนะนำนี้เป็นแนวทางเทคนิค ไม่ใช่คำปรึกษาทางกฎหมาย สำหรับความเป็นไปตามกฎหมายที่สมบูรณ์ ควรปรึกษาผู้เชี่ยวชาญด้านกฎหมายข้อมูลส่วนบุคคล
