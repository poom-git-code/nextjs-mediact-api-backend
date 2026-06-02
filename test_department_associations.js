// Test script to verify the getPartnerDepartmentByFacility function
// This is a simple test to check if the associations work properly

const { getPartnerDepartmentByFacility } = require('./src/services/departmentService');

// Test function
async function testDepartmentAssociations() {
  try {
    // Replace with a valid user ID from your database
    const userId = 1; // Change this to a valid user ID
    
    console.log('Testing getPartnerDepartmentByFacility...');
    const result = await getPartnerDepartmentByFacility(userId);
    
    console.log('Result:', JSON.stringify(result, null, 2));
    
    // Check if the associations are loaded
    if (result && result.length > 0) {
      const firstDepartment = result[0];
      console.log('\nFirst department associations:');
      console.log('- Department Operating Hours:', firstDepartment.department_operating_hours || 'Not loaded');
      console.log('- Department Supervisors:', firstDepartment.department_supervisors || 'Not loaded');
      console.log('- Shift Types:', firstDepartment.shift_types || 'Not loaded');
    }
    
  } catch (error) {
    console.error('Error testing department associations:', error.message);
  }
}

// Run the test
testDepartmentAssociations();
