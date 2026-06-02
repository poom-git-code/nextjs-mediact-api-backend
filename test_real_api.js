// test_real_api.js
// Test the actual API endpoint

const axios = require('axios');

async function testRealAPI() {
  try {
    // You need to replace this with a real JWT token from your authentication
    const token = 'your_jwt_token_here';
    
    console.log('Testing real API endpoint...');
    
    const response = await axios.get('http://localhost:3600/api/departments/partner', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('=== API Response ===');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.departments && response.data.departments.length > 0) {
      const firstDept = response.data.departments[0];
      console.log('\n=== First Department Analysis ===');
      console.log('Keys:', Object.keys(firstDept));
      console.log('Has department_operating_hours:', !!firstDept.department_operating_hours);
      console.log('Has department_supervisors:', !!firstDept.department_supervisors);
      console.log('Has shift_types:', !!firstDept.shift_types);
      
      if (firstDept.department_operating_hours) {
        console.log('Operating hours count:', firstDept.department_operating_hours.length);
      }
      if (firstDept.department_supervisors) {
        console.log('Supervisors count:', firstDept.department_supervisors.length);
      }
      if (firstDept.shift_types) {
        console.log('Shift types count:', firstDept.shift_types.length);
      }
    }
    
  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else {
      console.error('Network Error:', error.message);
    }
    console.log('\nNote: You need to replace "your_jwt_token_here" with a real JWT token');
    console.log('You can get a token by logging in through your authentication endpoint');
  }
  
  process.exit(0);
}

testRealAPI();
