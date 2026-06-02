import { Context } from 'koa';
import { getLanguage, createLocalizedResponse } from '../middleware/languageMiddleware';

/**
 * Example Controller แสดงวิธีการใช้งาน language parameter
 */

// ตัวอย่างการใช้งาน getLanguage() และ createLocalizedResponse()
export const exampleWithLanguage = async (ctx: Context) => {
  try {
    const language = getLanguage(ctx);
    
    // ข้อความที่สนับสนุนหลายภาษา
    const messages = {
      th: {
        welcome: 'ยินดีต้อนรับ',
        success: 'ดำเนินการสำเร็จ',
        userFound: 'พบข้อมูลผู้ใช้แล้ว'
      },
      en: {
        welcome: 'Welcome',
        success: 'Operation successful',
        userFound: 'User data found'
      }
    };
    
    const currentMessages = messages[language as keyof typeof messages] || messages.th;
    
    const responseData = {
      message: currentMessages.welcome,
      timestamp: new Date().toISOString(),
      language: language,
      supportedLanguages: ['th', 'en']
    };
    
    // ใช้ helper function สำหรับสร้าง response
    ctx.body = createLocalizedResponse(ctx, responseData, currentMessages.success);
    
  } catch (error: any) {
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

// ตัวอย่างการใช้ในฟังก์ชันที่ดึงข้อมูล user
export const getUserInfoWithLanguage = async (ctx: Context) => {
  try {
    const language = getLanguage(ctx);
    const userId = ctx.params.id;
    
    // Mock user data
    const userData = {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      status: 'active'
    };
    
    // ข้อความตาม language
    const statusMessages = {
      th: {
        active: 'ใช้งานได้',
        inactive: 'ไม่ได้ใช้งาน',
        pending: 'รอการอนุมัติ'
      },
      en: {
        active: 'Active',
        inactive: 'Inactive', 
        pending: 'Pending'
      }
    };
    
    const currentMessages = statusMessages[language as keyof typeof statusMessages] || statusMessages.th;
    
    // แปลง status เป็นภาษาที่เลือก
    const localizedUserData = {
      ...userData,
      statusText: currentMessages[userData.status as keyof typeof currentMessages] || userData.status
    };
    
    ctx.body = createLocalizedResponse(ctx, localizedUserData);
    
  } catch (error: any) {
    const language = getLanguage(ctx);
    const errorMessage = language === 'th' ? 'ไม่พบข้อมูลผู้ใช้' : 'User not found';
    
    ctx.status = 404;
    ctx.body = {
      success: false,
      language: language,
      message: errorMessage,
      error: error.message
    };
  }
};

// ตัวอย่างการใช้ในฟังก์ชันที่มี validation message
export const createUserWithLanguage = async (ctx: Context) => {
  try {
    const language = getLanguage(ctx);
    const { name, email } = ctx.request.body as any;
    
    // Validation messages
    const validationMessages = {
      th: {
        nameRequired: 'กรุณากรอกชื่อ',
        emailRequired: 'กรุณากรอกอีเมล',
        emailInvalid: 'รูปแบบอีเมลไม่ถูกต้อง',
        userCreated: 'สร้างผู้ใช้สำเร็จ'
      },
      en: {
        nameRequired: 'Name is required',
        emailRequired: 'Email is required',
        emailInvalid: 'Invalid email format',
        userCreated: 'User created successfully'
      }
    };
    
    const currentMessages = validationMessages[language as keyof typeof validationMessages] || validationMessages.th;
    
    // Validation
    if (!name) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        language: language,
        message: currentMessages.nameRequired
      };
      return;
    }
    
    if (!email) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        language: language,
        message: currentMessages.emailRequired
      };
      return;
    }
    
    // Mock การสร้าง user
    const newUser = {
      id: Math.floor(Math.random() * 1000),
      name,
      email,
      createdAt: new Date().toISOString()
    };
    
    ctx.status = 201;
    ctx.body = createLocalizedResponse(ctx, newUser, currentMessages.userCreated);
    
  } catch (error: any) {
    const language = getLanguage(ctx);
    const errorMessage = language === 'th' ? 'ไม่สามารถสร้างผู้ใช้ได้' : 'Cannot create user';
    
    ctx.status = 500;
    ctx.body = {
      success: false,
      language: language,
      message: errorMessage,
      error: error.message
    };
  }
};
