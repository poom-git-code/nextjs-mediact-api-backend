# Language Parameter Implementation Guide

## 📖 Overview
ระบบนี้รองรับการใช้งาน language parameter `?lang=th` หรือ `?lang=en` ในทุกเส้น API routes เพื่อให้ผู้ใช้สามารถเลือกภาษาที่ต้องการได้

## 🚀 Features
- ✅ รองรับ Thai (`th`) และ English (`en`)
- ✅ Default language คือ Thai (`th`)
- ✅ รับค่าจาก query parameter หรือ Accept-Language header
- ✅ เพิ่ม middleware ให้ทุก routes แล้ว
- ✅ Helper functions สำหรับ controllers

## 📝 How to Use

### 1. API Call Examples
```bash
# Thai language (default)
GET /api/users?lang=th
GET /api/departments?lang=th

# English language
GET /api/users?lang=en
GET /api/departments?lang=en

# ถ้าไม่ใส่ lang parameter จะใช้ Thai เป็น default
GET /api/users
```

### 2. Using in Controllers
```typescript
import { getLanguage, createLocalizedResponse } from '../middleware/languageMiddleware';

export const getUsers = async (ctx: Context) => {
  try {
    const language = getLanguage(ctx); // 'th' or 'en'
    
    // ข้อความที่รองรับหลายภาษา
    const messages = {
      th: {
        success: 'ดึงข้อมูลผู้ใช้สำเร็จ',
        notFound: 'ไม่พบข้อมูลผู้ใช้'
      },
      en: {
        success: 'Users retrieved successfully',
        notFound: 'Users not found'
      }
    };
    
    const currentMessages = messages[language] || messages.th;
    
    // Your logic here...
    const users = await UserService.getAllUsers();
    
    // ใช้ helper function สำหรับ response
    ctx.body = createLocalizedResponse(ctx, users, currentMessages.success);
    
  } catch (error) {
    const language = getLanguage(ctx);
    const errorMessage = language === 'th' ? 'เกิดข้อผิดพลาด' : 'An error occurred';
    
    ctx.status = 500;
    ctx.body = {
      success: false,
      language: language,
      message: errorMessage,
      error: error.message
    };
  }
};
```

### 3. Response Format
```json
{
  "success": true,
  "language": "th",
  "message": "ดำเนินการสำเร็จ",
  "data": {
    // Your data here
  }
}
```

## 🔧 Implementation Details

### Files Modified
1. **Language Middleware**: `src/middleware/languageMiddleware.ts`
2. **All Route Files**: Added `languageMiddleware` to all routes
3. **Example Controller**: `src/controllers/exampleLanguageController.ts`
4. **Example Routes**: `src/routes/exampleLanguageRoutes.ts`

### Language Priority
1. Query parameter `?lang=th` (highest priority)
2. Accept-Language header
3. Default to Thai (`th`)

## 🧪 Testing

### Test Routes Available
```bash
# Test basic functionality
GET /api/example/test?lang=th
GET /api/example/test?lang=en

# Test with user data
GET /api/example/user/123?lang=th
GET /api/example/user/123?lang=en

# Test with POST request
POST /api/example/user?lang=th
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Example Test Commands
```bash
# Thai
curl "http://localhost:3033/api/example/test?lang=th"

# English
curl "http://localhost:3033/api/example/test?lang=en"

# Default (Thai)
curl "http://localhost:3033/api/example/test"

# Using header
curl -H "Accept-Language: en" "http://localhost:3033/api/example/test"
```

## 🛠 Middleware Functions

### `languageMiddleware(ctx, next)`
- จัดการ language parameter
- เก็บ language ใน `ctx.state.language`

### `getLanguage(ctx): string`
- ดึง language ที่เลือกจาก context
- Return `'th'` หรือ `'en'`

### `createLocalizedResponse(ctx, data, message?)`
- สร้าง response ที่มี language information
- รวม success, language, message, และ data

## 📋 Supported Languages
- `th` - Thai (ไทย) - Default
- `en` - English

## 🔄 Adding New Languages

1. แก้ไข `supportedLanguages` array ใน `languageMiddleware.ts`
2. เพิ่ม translations ใน controllers
3. Update documentation

```typescript
const supportedLanguages = ['th', 'en', 'ja']; // เพิ่ม 'ja' สำหรับ Japanese
```

## ⚠️ Important Notes

1. **All routes** มี language middleware แล้ว
2. **Default language** คือ Thai (`th`)
3. **Backward compatibility** - API เดิมยังใช้งานได้ปกติ
4. **Error messages** ควรมีการแปลตาม language ที่เลือก
5. **Database queries** ไม่เปลี่ยนแปลง - แค่การแสดงผล

## 🎯 Next Steps

1. เพิ่ม translations ใน existing controllers
2. เพิ่ม language สำหรับ validation messages  
3. เพิ่ม language ใน error responses
4. สร้าง translation files สำหรับจัดการ messages ในที่เดียว
