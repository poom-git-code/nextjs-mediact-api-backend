const fs = require('fs');

const servicesToFix = [
  './src/services/dayOffService.ts',
  './src/services/departmentSupervisorService.ts',
  './src/services/facilityAdminService.ts', 
  './src/services/facilityService.ts',
  './src/services/leaveRequestService.ts',
  './src/services/scheduleShiftService.ts',
  './src/services/userService.ts'
];

servicesToFix.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove existing incorrect import if exists
  content = content.replace(/import { getUserAttributes, getBasicUserAttributes, getUserWithUsernameAttributes } from "\.\.\/utils\/encryptedFieldMapping";\n/g, '');
  
  // Add correct import at the beginning after first import
  const lines = content.split('\n');
  const importLineIndex = lines.findIndex(line => line.startsWith('import'));
  
  if (importLineIndex !== -1) {
    lines.splice(importLineIndex + 1, 0, 'import { getUserAttributes, getBasicUserAttributes, getUserWithUsernameAttributes } from "../utils/encryptedFieldMapping";');
  }
  
  content = lines.join('\n');
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed ${filePath.split('/').pop()}`);
});
