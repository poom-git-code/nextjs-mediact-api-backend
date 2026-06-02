const axios = require('axios');

const BASE_URL = 'http://localhost:3601';

const testEndpoints = async () => {
  console.log('🚀 Testing API endpoints...');
  
  // Test 1: Root endpoint
  try {
    console.log('\n1. Testing root endpoint...');
    const response = await axios.get(`${BASE_URL}/`);
    console.log('✅ Root endpoint works:', response.status);
  } catch (error) {
    console.log('❌ Root endpoint failed:', error.code || error.message);
  }
  
  // Test 2: Partner login endpoint
  try {
    console.log('\n2. Testing partner login endpoint...');
    const response = await axios.post(`${BASE_URL}/partner/auth/login`, {
      identifier: 'H0110001',
      password: '11111111'
    });
    console.log('✅ Partner login success!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Partner login failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.code || error.message);
    }
  }
  
  // Test 3: Regular login endpoint
  try {
    console.log('\n3. Testing regular login-v2 endpoint...');
    const response = await axios.post(`${BASE_URL}/auth/login-v2`, {
      identifier: 'H0110001',
      password: '11111111'
    });
    console.log('✅ Login-v2 success!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Login-v2 failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.code || error.message);
    }
  }
  
  console.log('\n🏁 Test completed!');
};

testEndpoints();
