// test_api_response.js
// Test the actual API response vs direct service call

const { setupAssociations } = require('./dist/models/associations');
const { getPartnerDepartmentByFacility } = require('./dist/services/departmentService');

async function testAPIResponse() {
  try {
    console.log('Setting up associations...');
    setupAssociations();
    
    console.log('Testing direct service call...');
    const userId = 1;
    const departments = await getPartnerDepartmentByFacility(userId);
    
    console.log('=== Direct Service Call Result ===');
    console.log('Number of departments:', departments.length);
    
    if (departments.length > 0) {
      const firstDept = departments[0];
      console.log('First department keys:', Object.keys(firstDept.dataValues || firstDept));
      console.log('Has department_operating_hours:', !!firstDept.department_operating_hours);
      console.log('Has department_supervisors:', !!firstDept.department_supervisors);
      console.log('Has shift_types:', !!firstDept.shift_types);
      
      // Check if data exists
      if (firstDept.department_operating_hours) {
        console.log('Operating hours count:', firstDept.department_operating_hours.length);
      }
      if (firstDept.department_supervisors) {
        console.log('Supervisors count:', firstDept.department_supervisors.length);
      }
      if (firstDept.shift_types) {
        console.log('Shift types count:', firstDept.shift_types.length);
      }
      
      // Test JSON serialization
      console.log('\n=== JSON Serialization Test ===');
      const jsonResult = JSON.stringify({ departments });
      const parsedResult = JSON.parse(jsonResult);
      
      console.log('JSON keys:', Object.keys(parsedResult.departments[0]));
      console.log('JSON has department_operating_hours:', !!parsedResult.departments[0].department_operating_hours);
      console.log('JSON has department_supervisors:', !!parsedResult.departments[0].department_supervisors);
      console.log('JSON has shift_types:', !!parsedResult.departments[0].shift_types);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}

testAPIResponse();
