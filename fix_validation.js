const fs = require('fs');

// Read the validation file
let content = fs.readFileSync('src/validations/shiftTypeValidation.ts', 'utf8');

// Add priority fields to both createShiftTypeSchema and updateShiftTypeSchema
const priorityFields = `      is_primary_group: Joi.boolean().optional().messages({
        'boolean.base': 'Is primary group must be a boolean.',
      }),
      priority_level: Joi.number().integer().min(1).max(10).optional().messages({
        'number.base': 'Priority level must be a number.',
        'number.integer': 'Priority level must be an integer.',
        'number.min': 'Priority level must be at least 1.',
        'number.max': 'Priority level must be at most 10.',
      }),`;

// Replace in both schemas
content = content.replace(
  /(\s+max_count: Joi\.number\(\)\.integer\(\)\.min\(0\)\.optional\(\)\.messages\(\{\s+'number\.base': 'Max count must be a number\.',\s+'number\.integer': 'Max count must be an integer\.',\s+'number\.min': 'Max count must be at least 0\.',\s+\}\),)\s+(\}\))/g,
  `$1
${priorityFields}
$2`
);

// Write the updated content
fs.writeFileSync('src/validations/shiftTypeValidation.ts', content, 'utf8');

console.log('Validation schema updated with priority fields');
