const fs = require('fs');

const filePath = './src/services/departmentService.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Replace basic user attributes patterns
content = content.replace(
  /attributes:\s*\[\s*"id",\s*"first_name",\s*"last_name",\s*"email"\s*\]/g,
  'attributes: getBasicUserAttributes()'
);

// Replace full user attributes patterns  
content = content.replace(
  /attributes:\s*\[\s*"id",\s*"username",\s*"first_name",\s*"last_name",\s*"email",\s*"phone_number",\s*"profile_picture"\s*\]/g,
  'attributes: getUserAttributes()'
);

fs.writeFileSync(filePath, content);
console.log('✅ Updated remaining departmentService.ts field mappings');
