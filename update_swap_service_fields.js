const fs = require('fs');

const filePath = './src/services/swapRequestService.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Replace patterns for basic user attributes (id, first_name, last_name, email)
const basicPattern = /attributes:\s*\[\s*"id",\s*"first_name",\s*"last_name",\s*"email"\s*\]/g;
content = content.replace(basicPattern, 'attributes: getBasicUserAttributes()');

// Replace patterns for username user attributes (id, username, first_name, last_name, email)
const usernamePattern = /attributes:\s*\[\s*"id",\s*"username",\s*"first_name",\s*"last_name",\s*"email"\s*\]/g;
content = content.replace(usernamePattern, 'attributes: getUserWithUsernameAttributes()');

fs.writeFileSync(filePath, content);
console.log('✅ Updated swapRequestService.ts field mappings');
