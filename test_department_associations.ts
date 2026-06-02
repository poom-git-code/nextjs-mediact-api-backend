import { getPartnerDepartmentByFacility } from './src/services/departmentService';

// Test function to verify the associations work
async function testDepartmentAssociations() {
  try {
    // Replace with a valid user ID from your database
    const userId = 1; // Change this to a valid user ID
    
    console.log('Testing getPartnerDepartmentByFacility with associations...');
    const result = await getPartnerDepartmentByFacility(userId);
    
    console.log('Result count:', result.length);
    
    // Check if the associations are loaded
    if (result && result.length > 0) {
      const firstDepartment = result[0];
      console.log('\nFirst department:', firstDepartment.name);
      console.log('Associations loaded:');
      console.log('- Department Operating Hours:', firstDepartment.department_operating_hours?.length || 0, 'records');
      console.log('- Department Supervisors:', firstDepartment.department_supervisors?.length || 0, 'records');
      console.log('- Shift Types:', firstDepartment.shift_types?.length || 0, 'records');
      
      // Log sample data if available
      if (firstDepartment.department_operating_hours && firstDepartment.department_operating_hours.length > 0) {
        console.log('\nSample Operating Hours:', firstDepartment.department_operating_hours[0]);
      }
      
      if (firstDepartment.department_supervisors && firstDepartment.department_supervisors.length > 0) {
        console.log('\nSample Supervisor:', firstDepartment.department_supervisors[0]);
      }
      
      if (firstDepartment.shift_types && firstDepartment.shift_types.length > 0) {
        console.log('\nSample Shift Type:', firstDepartment.shift_types[0]);
      }
    }
    
  } catch (error) {
    console.error('Error testing department associations:', error);
  }
}

// Run the test
testDepartmentAssociations();
