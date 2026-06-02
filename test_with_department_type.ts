import { setupAssociations } from './src/models/associations';
import { getPartnerDepartmentByFacility } from './src/services/departmentService';

async function testWithDepartmentType() {
  try {
    console.log('Setting up associations...');
    setupAssociations();
    
    console.log('Testing getPartnerDepartmentByFacility with department type...');
    
    const userId = 1;
    const departments = await getPartnerDepartmentByFacility(userId);
    
    console.log(`Found ${departments.length} departments`);
    
    if (departments.length > 0) {
      const firstDepartment = departments[0];
      console.log('\n=== First Department ===');
      console.log('ID:', firstDepartment.id);
      console.log('Name:', firstDepartment.name);
      console.log('Type ID:', firstDepartment.type_id);
      
      console.log('\n=== Department Type ===');
      if (firstDepartment.type) {
        console.log('Type Data:', firstDepartment.type.name);
      } else {
        console.log('Type: No data or not loaded');
      }
      
      console.log('\n=== Created/Updated By Users ===');
      if (firstDepartment.created_by_user) {
        console.log('Created by:', firstDepartment.created_by_user.first_name, firstDepartment.created_by_user.last_name);
      } else {
        console.log('Created by: No data or not loaded');
      }
      
      if (firstDepartment.updated_by_user) {
        console.log('Updated by:', firstDepartment.updated_by_user.first_name, firstDepartment.updated_by_user.last_name);
      } else {
        console.log('Updated by: No data or not loaded');
      }
      
      console.log('\n=== Other Related Data ===');
      console.log('Operating Hours:', firstDepartment.department_operating_hours?.length || 0, 'records');
      console.log('Supervisors:', firstDepartment.department_supervisors?.length || 0, 'records');
      
      // Show supervisor details with user data
      if (firstDepartment.department_supervisors && firstDepartment.department_supervisors.length > 0) {
        console.log('\n=== Supervisor Details ===');
        firstDepartment.department_supervisors.forEach((supervisor, index) => {
          console.log(`Supervisor ${index + 1}:`);
          console.log('  ID:', supervisor.id);
          console.log('  Role:', supervisor.role);
          console.log('  User ID:', supervisor.user_id);
          if (supervisor.user) {
            console.log('  User Data:', supervisor.user);
          } else {
            console.log('  User Data: Not loaded');
          }
        });
      }
      
      console.log('\nShift Types:', firstDepartment.shift_types?.length || 0, 'records');
    }
    
  } catch (error) {
    console.error('Error:', (error as Error).message);
  }
  
  process.exit(0);
}

testWithDepartmentType();
