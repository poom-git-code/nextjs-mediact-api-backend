const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, 'src', 'services');

// Decryption template
const getDecryptionTemplate = (dataVariableName, userFields) => {
  let decryptionCode = `
  // Process PIPEDA decryption for ${dataVariableName}
  const processed${dataVariableName.charAt(0).toUpperCase() + dataVariableName.slice(1)} = ${dataVariableName}.map((item: any) => {
    const itemData = item.get({ plain: true });
`;

  userFields.forEach(field => {
    decryptionCode += `
    // Decrypt ${field} data
    if (itemData.${field}) {
      itemData.${field} = PipedaUserDataHandler.decryptUserData(itemData.${field});
    }
`;
  });

  decryptionCode += `
    return itemData;
  });

  return processed${dataVariableName.charAt(0).toUpperCase() + dataVariableName.slice(1)};`;

  return decryptionCode;
};

// Service patterns ที่ต้องแก้ไข
const servicePatterns = {
  'departmentOperatingHoursService.ts': [
    {
      returnPattern: /return\s+(\w+);(\s*}\s*export)/g,
      dataVariable: 'operatingHours',
      userFields: ['created_by_user', 'updated_by_user']
    }
  ],
  'facilityService.ts': [
    {
      returnPattern: /return\s+(\w+);(\s*}\s*export)/g,
      dataVariable: 'facilities',
      userFields: ['created_by_user', 'updated_by_user']
    }
  ],
  'departmentSupervisorService.ts': [
    {
      returnPattern: /return\s+(\w+);(\s*}\s*export)/g,
      dataVariable: 'supervisors',
      userFields: ['created_by_user', 'updated_by_user', 'user']
    }
  ],
  'scheduleMasterService.ts': [
    {
      returnPattern: /return\s+(\w+);(\s*}\s*export)/g,
      dataVariable: 'schedules',
      userFields: ['created_by_user', 'updated_by_user']
    }
  ]
};

// ประมวลผลแต่ละ service
Object.entries(servicePatterns).forEach(([serviceFile, patterns]) => {
  const filePath = path.join(servicesDir, serviceFile);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    console.log(`Processing ${serviceFile}...`);
    
    patterns.forEach(pattern => {
      // หา functions ที่มี include user data และ return array
      const functionMatches = content.match(/export\s+const\s+\w+\s*=\s*async[^}]+include[^}]+return\s+\w+;/gs);
      
      if (functionMatches) {
        functionMatches.forEach(match => {
          if (match.includes('created_by_user') || match.includes('updated_by_user')) {
            const varMatch = match.match(/return\s+(\w+);/);
            if (varMatch) {
              const dataVar = varMatch[1];
              const decryptionCode = getDecryptionTemplate(dataVar, pattern.userFields);
              
              // แทนที่ return statement
              const newFunction = match.replace(
                new RegExp(`return\\s+${dataVar};`),
                decryptionCode
              );
              
              content = content.replace(match, newFunction);
            }
          }
        });
      }
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${serviceFile}`);
  } else {
    console.log(`❌ File not found: ${serviceFile}`);
  }
});

console.log('🎉 Decryption processing added!');
