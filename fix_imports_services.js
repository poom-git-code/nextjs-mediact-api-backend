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
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if import already exists
  if (content.includes('encryptedFieldMapping')) {
    console.log(`✅ ${filePath.split('/').pop()} already has import`);
    return;
  }
  
  // Add import at the top of the file after other imports
  const lines = content.split('\n');
  let importAdded = false;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import') && lines[i+1] && !lines[i+1].startsWith('import')) {
      lines.splice(i+1, 0, 'import { getUserAttributes, getBasicUserAttributes, getUserWithUsernameAttributes } from "../utils/encryptedFieldMapping";');
      importAdded = true;
      break;
    }
  }
  
  if (!importAdded) {
    // If no good place found, add after first import
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import')) {
        lines.splice(i+1, 0, 'import { getUserAttributes, getBasicUserAttributes, getUserWithUsernameAttributes } from "../utils/encryptedFieldMapping";');
        break;
      }
    }
  }
  
  content = lines.join('\n');
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed imports in ${filePath.split('/').pop()}`);
});
