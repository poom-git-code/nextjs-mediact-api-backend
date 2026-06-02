const axios = require('axios');

const testUserData = async () => {
  try {
    // Replace with your actual API endpoint and token
    const baseURL = 'http://localhost:3600';
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJraXR0aXNhay5rMDI4IiwiZW1haWwiOiJraXR0aXNhay5rMDI4QGdtYWlsLmNvbSIsImlhdCI6MTczNzUzNjI2MiwiZXhwIjoxNzM3NTM5ODYyfQ.KrQo4J_5FfL4eIAFEKRR-8GFYdHvLcdZm_DzjUvdHn0';
    
    const response = await axios.get(`${baseURL}/api/departments/partner-departments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response data structure:');
    
    if (response.data && response.data.data && response.data.data.length > 0) {
      const department = response.data.data[0];
      console.log('\nDepartment info:');
      console.log('- Name:', department.name);
      console.log('- ID:', department.id);
      console.log('- Created by:', department.created_by);
      console.log('- Updated by:', department.updated_by);
      
      console.log('\nUser data for created_by:');
      if (department.created_by_user) {
        console.log('- Created by user ID:', department.created_by_user.id);
        console.log('- Created by user name:', department.created_by_user.first_name, department.created_by_user.last_name);
        console.log('- Created by user email:', department.created_by_user.email);
      } else {
        console.log('- No created_by_user data found');
      }
      
      console.log('\nUser data for updated_by:');
      if (department.updated_by_user) {
        console.log('- Updated by user ID:', department.updated_by_user.id);
        console.log('- Updated by user name:', department.updated_by_user.first_name, department.updated_by_user.last_name);
        console.log('- Updated by user email:', department.updated_by_user.email);
      } else {
        console.log('- No updated_by_user data found');
      }
      
      console.log('\nDepartment supervisors:');
      if (department.department_supervisors && department.department_supervisors.length > 0) {
        department.department_supervisors.forEach((supervisor, index) => {
          console.log(`- Supervisor ${index + 1}:`, supervisor.user ? `${supervisor.user.first_name} ${supervisor.user.last_name}` : 'No user data');
        });
      } else {
        console.log('- No supervisors found');
      }
    } else {
      console.log('No departments found in response');
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

testUserData();
