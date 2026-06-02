// test_department_with_related_data.js
// Test script to verify that related data is included in the department query

const { getPartnerDepartmentByFacility } = require('./dist/services/departmentService');

async function testDepartmentWithRelatedData() {
  try {
    console.log('Testing getPartnerDepartmentByFacility with related data...');
    
    // Replace with a valid user ID from your database
    const userId = 1; // Change this to a valid user ID
    
    const departments = await getPartnerDepartmentByFacility(userId);
    
    console.log(`Found ${departments.length} departments`);
    
    if (departments.length > 0) {
      const firstDepartment = departments[0];
      console.log('\n=== First Department ===');
      console.log('ID:', firstDepartment.id);
      console.log('Name:', firstDepartment.name);
      console.log('Facility ID:', firstDepartment.facility_id);
      
      console.log('\n=== Related Data ===');
      
      // Check Department Operating Hours
      if (firstDepartment.department_operating_hours) {
        console.log('Operating Hours:', firstDepartment.department_operating_hours.length, 'records');
        if (firstDepartment.department_operating_hours.length > 0) {
          console.log('Sample:', firstDepartment.department_operating_hours[0]);
        }
      } else {
        console.log('Operating Hours: No data or not loaded');
      }
      
      // Check Department Supervisors
      if (firstDepartment.department_supervisors) {
        console.log('Supervisors:', firstDepartment.department_supervisors.length, 'records');
        if (firstDepartment.department_supervisors.length > 0) {
          console.log('Sample:', firstDepartment.department_supervisors[0]);
        }
      } else {
        console.log('Supervisors: No data or not loaded');
      }
      
      // Check Shift Types
      if (firstDepartment.shift_types) {
        console.log('Shift Types:', firstDepartment.shift_types.length, 'records');
        if (firstDepartment.shift_types.length > 0) {
          console.log('Sample:', firstDepartment.shift_types[0]);
        }
      } else {
        console.log('Shift Types: No data or not loaded');
      }
      
      console.log('\n=== Full Data Structure ===');
      console.log(JSON.stringify(firstDepartment, null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
  
  process.exit(0);
}

// Run the test
testDepartmentWithRelatedData();
