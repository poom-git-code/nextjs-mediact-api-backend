const fs = require('fs');

const servicesToUpdate = [
  './src/services/dayOffService.ts',
  './src/services/scheduleShiftService.ts', 
  './src/services/facilityService.ts',
  './src/services/certificationService.ts',
  './src/services/departmentSupervisorService.ts',
  './src/services/userService.ts',
  './src/services/facilityAdminService.ts'
];

servicesToUpdate.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add import if not exists
  const importPattern = /(import { PipedaUserDataHandler } from "\.\.\/middleware\/pipedaUserDataHandler";)/;
  const importReplacement = '$1\nimport { getUserAttributes, getBasicUserAttributes, getUserWithUsernameAttributes } from "../utils/encryptedFieldMapping";';
  
  if (!content.includes('encryptedFieldMapping')) {
    content = content.replace(importPattern, importReplacement);
  }
  
  // Replace patterns for basic user attributes (id, first_name, last_name, email)
  const basicPattern = /attributes:\s*\[\s*"id",\s*"first_name",\s*"last_name",\s*"email"\s*\]/g;
  content = content.replace(basicPattern, 'attributes: getBasicUserAttributes()');
  
  // Replace patterns for username user attributes (id, username, first_name, last_name, email)
  const usernamePattern = /attributes:\s*\[\s*"id",\s*"username",\s*"first_name",\s*"last_name",\s*"email"\s*\]/g;
  content = content.replace(usernamePattern, 'attributes: getUserWithUsernameAttributes()');
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Updated ${filePath.split('/').pop()}`);
});
