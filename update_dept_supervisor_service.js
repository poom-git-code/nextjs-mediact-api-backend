const fs = require('fs');

const filePath = './src/services/departmentSupervisorService.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Replace patterns for basic user attributes without email (id, first_name, last_name)
content = content.replace(
  /attributes:\s*\[\s*"id",\s*"first_name",\s*"last_name"\s*\]/g,
  'attributes: ["id", ["first_name_encrypted", "first_name"], ["last_name_encrypted", "last_name"]] as any'
);

fs.writeFileSync(filePath, content);
console.log('✅ Updated departmentSupervisorService.ts remaining field mappings');
