const fs = require('fs');

const servicesToUpdate = [
  './src/services/userGroupTagService.ts',
  './src/services/userExperienceService.ts', 
  './src/services/scheduleShiftLogsService.ts'
];

servicesToUpdate.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add import if not exists
  if (!content.includes('encryptedFieldMapping')) {
    const lines = content.split('\n');
    const importLineIndex = lines.findIndex(line => line.startsWith('import'));
    
    if (importLineIndex !== -1) {
      lines.splice(importLineIndex + 1, 0, 'import { getUserAttributes, getBasicUserAttributes, getUserWithUsernameAttributes } from "../utils/encryptedFieldMapping";');
    }
    
    content = lines.join('\n');
  }
  
  // Replace patterns for basic user attributes (id, first_name, last_name, email)
  content = content.replace(
    /attributes:\s*\[\s*"id",\s*"first_name",\s*"last_name",\s*"email"\s*\]/g,
    'attributes: getBasicUserAttributes()'
  );
  
  // Replace patterns for basic user attributes without email (id, first_name, last_name)
  content = content.replace(
    /attributes:\s*\[\s*"id",\s*"first_name",\s*"last_name"\s*\]/g,
    'attributes: ["id", ["first_name_encrypted", "first_name"], ["last_name_encrypted", "last_name"]] as any'
  );
  
  // Replace patterns for username user attributes with email (id, username, first_name, last_name, email)
  content = content.replace(
    /attributes:\s*\[\s*"id",\s*"username",\s*"first_name",\s*"last_name",\s*"email"\s*\]/g,
    'attributes: getUserWithUsernameAttributes()'
  );
  
  // Replace patterns for full user attributes (id, username, first_name, last_name, email, phone_number, profile_picture)
  content = content.replace(
    /attributes:\s*\[\s*"id",\s*"username",\s*"first_name",\s*"last_name",\s*"email",\s*"phone_number",\s*"profile_picture"\s*\]/g,
    'attributes: getUserAttributes()'
  );
  
  // Replace patterns for user attributes with profile_picture but no phone (id, username, first_name, last_name, email, profile_picture)
  content = content.replace(
    /attributes:\s*\[\s*"id",\s*"username",\s*"first_name",\s*"last_name",\s*"email",\s*"profile_picture"\s*\]/g,
    'attributes: ["id", "username", ["first_name_encrypted", "first_name"], ["last_name_encrypted", "last_name"], ["email_encrypted", "email"], "profile_picture"] as any'
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Updated ${filePath.split('/').pop()}`);
});
