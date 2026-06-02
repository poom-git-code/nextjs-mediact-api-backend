const axios = require('axios');

// Test department API with authentication
const testDepartmentAPI = async () => {
  try {
    // Replace with actual token
    const token = 'your_jwt_token_here';
    
    console.log('Testing Department API...');
    
    // Test GET /departments/1/details
    const response = await axios.get('http://localhost:3600/api/v1/departments/1/details', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Department Details Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    if (error.response) {
      console.error('Error Response:', error.response.data);
      console.error('Status:', error.response.status);
    } else {
      console.error('Error:', error.message);
    }
  }
};

// Run test
testDepartmentAPI();
