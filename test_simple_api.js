// test_simple_api.js
// Test the API endpoint without authentication (if possible)

const axios = require('axios');

async function testSimpleAPI() {
  try {
    console.log('Testing API endpoint without auth...');
    
    // Test the endpoint
    const response = await axios.get('http://localhost:3600/api/departments/partner/facility');
    
    console.log('=== API Response ===');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
      
      // If it's 401 (unauthorized), that's expected
      if (error.response.status === 401) {
        console.log('\nThis is expected - endpoint requires authentication');
        console.log('The good news is that the route exists and the server is responding');
      }
    } else {
      console.error('Network Error:', error.message);
    }
  }
  
  process.exit(0);
}

testSimpleAPI();
