const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, 'src', 'services');

// Services ที่ต้องเพิ่ม PIPEDA import และ decryption
const servicesToUpdate = [
  'departmentOperatingHoursService.ts',
  'facilityService.ts', 
  'departmentSupervisorService.ts',
  'scheduleMasterService.ts'
];

// เพิ่ม PIPEDA imports หากยังไม่มี
const addPipedaImports = (content) => {
  if (content.includes('PipedaUserDataHandler')) {
    return content;
  }
  
  // หา import line สุดท้าย
  const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
  const lastImportIndex = content.lastIndexOf(importLines[importLines.length - 1]);
  const afterLastImport = content.indexOf('\n', lastImportIndex) + 1;
  
  const pipedaImports = `import { getUserAttributes, getBasicUserAttributes, getUserWithUsernameAttributes } from "../utils/encryptedFieldMapping";
import { PipedaUserDataHandler } from '../middleware/pipedaUserDataHandler';

`;

  return content.slice(0, afterLastImport) + pipedaImports + content.slice(afterLastImport);
};

// เพิ่ม attributes สำหรับ UserModel includes
const updateUserModelIncludes = (content) => {
  // แทนที่ created_by_user และ updated_by_user includes ที่ไม่มี attributes
  content = content.replace(
    /as:\s*["']created_by_user["'],\s*required:\s*false,?\s*}/g,
    'as: "created_by_user",\n        required: false,\n        attributes: getUserAttributes(),\n      }'
  );
  
  content = content.replace(
    /as:\s*["']updated_by_user["'],\s*required:\s*false,?\s*}/g,
    'as: "updated_by_user",\n        required: false,\n        attributes: getUserAttributes(),\n      }'
  );

  return content;
};

servicesToUpdate.forEach(serviceFile => {
  const filePath = path.join(servicesDir, serviceFile);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    console.log(`Updating ${serviceFile}...`);
    
    // เพิ่ม imports
    content = addPipedaImports(content);
    
    // เพิ่ม attributes
    content = updateUserModelIncludes(content);
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${serviceFile}`);
  } else {
    console.log(`❌ File not found: ${serviceFile}`);
  }
});

console.log('🎉 Bulk update completed!');
