const fs = require('fs');

const filePath = './src/services/leaveRequestService.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Add import at the top after PipedaUserDataHandler import
const importPattern = /(import { PipedaUserDataHandler } from "\.\.\/middleware\/pipedaUserDataHandler";)/;
const importReplacement = '$1\nimport { getUserAttributes, getBasicUserAttributes, getUserWithUsernameAttributes } from "../utils/encryptedFieldMapping";';

if (!content.includes('encryptedFieldMapping')) {
  content = content.replace(importPattern, importReplacement);
}

// Replace patterns for basic user attributes (id, first_name, last_name, email)
const basicPattern = /attributes:\s*\[\s*"id",\s*"first_name",\s*"last_name",\s*"email"\s*\]/g;
content = content.replace(basicPattern, 'attributes: getBasicUserAttributes()');

fs.writeFileSync(filePath, content);
console.log('✅ Updated leaveRequestService.ts field mappings');
