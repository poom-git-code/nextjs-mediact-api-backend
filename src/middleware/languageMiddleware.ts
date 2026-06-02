import { Context, Next } from 'koa';

/**
 * Language Middleware - จัดการ language parameter สำหรับทุก API route
 * รับค่าจาก query parameter ?lang=th หรือ header Accept-Language
 */
export const languageMiddleware = async (ctx: Context, next: Next) => {
  // ดึง language จาก query parameter หรือ header
  const langFromQuery = ctx.query.lang as string;
  const langFromHeader = ctx.headers['accept-language'];
  
  // กำหนด default language และ supported languages
  const supportedLanguages = ['th', 'en'];
  const defaultLanguage = 'th';
  
  let language = defaultLanguage;
  
  // ตรวจสอบ language จาก query parameter ก่อน
  if (langFromQuery && supportedLanguages.includes(langFromQuery.toLowerCase())) {
    language = langFromQuery.toLowerCase();
  } 
  // ถ้าไม่มีใน query ให้ตรวจสอบจาก header
  else if (langFromHeader) {
    const headerLang = langFromHeader.split(',')[0].split('-')[0].toLowerCase();
    if (supportedLanguages.includes(headerLang)) {
      language = headerLang;
    }
  }
  
  // เก็บ language ใน ctx.state เพื่อให้ controller ใช้งานได้
  ctx.state.language = language;
  
  // Log การใช้งาน language (สำหรับ debug)
  console.log(`[Language Middleware] Request language: ${language} (from ${langFromQuery ? 'query' : 'header/default'})`);
  
  await next();
};

/**
 * Helper function สำหรับ controller ที่ต้องการดึง language
 */
export const getLanguage = (ctx: Context): string => {
  return ctx.state.language || 'th';
};

/**
 * Helper function สำหรับสร้าง response ที่มี language information
 */
export const createLocalizedResponse = (ctx: Context, data: any, message?: string) => {
  const language = getLanguage(ctx);
  
  return {
    success: true,
    language: language,
    message: message || (language === 'th' ? 'สำเร็จ' : 'Success'),
    data: data
  };
};

export default languageMiddleware;
