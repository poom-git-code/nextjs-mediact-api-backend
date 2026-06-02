const fs = require('fs');
const path = require('path');

// ฟังก์ชันเพิ่ม language middleware ให้ไฟล์ route
function addLanguageMiddleware(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // ตรวจสอบว่ามี languageMiddleware อยู่แล้วหรือไม่
    if (content.includes('languageMiddleware')) {
      console.log(`❌ ${path.basename(filePath)} - Already has language middleware`);
      return;
    }
    
    // ตรวจสอบว่าเป็นไฟล์ route หรือไม่
    if (!content.includes('import Router from') && !content.includes("import Router from")) {
      console.log(`❌ ${path.basename(filePath)} - Not a route file`);
      return;
    }
    
    let newContent = content;
    
    // เพิ่ม import statement
    const importRegex = /(import Router from ['"]koa-router['"];?\n)/;
    if (importRegex.test(newContent)) {
      newContent = newContent.replace(
        importRegex,
        "$1import { languageMiddleware } from '../middleware/languageMiddleware';\n"
      );
    }
    
    // เพิ่ม middleware ให้ router
    const routerRegex = /(const router = new Router\([^)]*\);?\n)/;
    if (routerRegex.test(newContent)) {
      newContent = newContent.replace(
        routerRegex,
        "$1\n// เพิ่ม language middleware ให้ทุก route\nrouter.use(languageMiddleware);\n"
      );
    }
    
    // เขียนไฟล์กลับ
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ ${path.basename(filePath)} - Added language middleware`);
    } else {
      console.log(`❌ ${path.basename(filePath)} - Could not modify`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// ดึงรายการไฟล์ routes ทั้งหมด
const routesDir = path.join(__dirname, 'src', 'routes');
const files = fs.readdirSync(routesDir);

console.log('🔄 Adding language middleware to all route files...\n');

// ประมวลผลทุกไฟล์
files.forEach(file => {
  if (file.endsWith('.ts') && file.includes('Routes')) {
    const filePath = path.join(routesDir, file);
    addLanguageMiddleware(filePath);
  }
});

console.log('\n✅ Completed adding language middleware to all routes!');
console.log('\n📝 How to use:');
console.log('   - Add ?lang=th to any API call');
console.log('   - Add ?lang=en for English');
console.log('   - Default language is Thai (th)');
console.log('   - Access language in controller: getLanguage(ctx)');
