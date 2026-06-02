const fs = require('fs');

const filePath = './src/services/auditService.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Add import after AuditLogModel import  
const importPattern = /(import AuditLogModel, { AuditLogAttributes } from '\.\.\/models\/AuditLogModel';)/;
const importReplacement = '$1\nimport { getUserAttributes, getBasicUserAttributes, getUserWithUsernameAttributes } from "../utils/encryptedFieldMapping";';

if (!content.includes('encryptedFieldMapping')) {
  content = content.replace(importPattern, importReplacement);
}

// Replace the specific pattern in auditService
const auditPattern = /attributes:\s*\[\s*'id',\s*'username',\s*'first_name',\s*'last_name',\s*'email'\s*\]/g;
content = content.replace(auditPattern, 'attributes: getUserWithUsernameAttributes()');

fs.writeFileSync(filePath, content);
console.log('✅ Updated auditService.ts field mappings');
