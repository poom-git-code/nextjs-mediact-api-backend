const axios = require('axios');

const testEncryptedAuth = async () => {
  const baseURL = 'http://localhost:3033';
  
  console.log('🧪 Testing encrypted authentication system...\n');
  
  try {
    // Test 1: Login with existing user email
    console.log('1. Testing loginUser with encrypted email...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@example.com', // ใช้ email ที่มีอยู่ในระบบ
      password: 'password123'
    });
    
    console.log('✅ Login successful!');
    console.log('User data:', {
      id: loginResponse.data.user.id,
      email: loginResponse.data.user.email,
      username: loginResponse.data.user.username,
      first_name: loginResponse.data.user.first_name,
      last_name: loginResponse.data.user.last_name
    });
    console.log('Token:', loginResponse.data.token ? 'Generated' : 'Missing');
    console.log('');
    
    // Test 2: Login V2 with email identifier
    console.log('2. Testing loginUserV2 with email identifier...');
    const loginV2Response = await axios.post(`${baseURL}/auth/login-v2`, {
      identifier: 'admin@example.com',
      password: 'password123'
    });
    
    console.log('✅ LoginV2 with email successful!');
    console.log('User data:', {
      id: loginV2Response.data.user.id,
      email: loginV2Response.data.user.email,
      username: loginV2Response.data.user.username
    });
    console.log('');
    
    // Test 3: Login V2 with username identifier
    console.log('3. Testing loginUserV2 with username identifier...');
    const loginV2UsernameResponse = await axios.post(`${baseURL}/auth/login-v2`, {
      identifier: 'admin', // ใช้ username
      password: 'password123'
    });
    
    console.log('✅ LoginV2 with username successful!');
    console.log('User data:', {
      id: loginV2UsernameResponse.data.user.id,
      email: loginV2UsernameResponse.data.user.email,
      username: loginV2UsernameResponse.data.user.username
    });
    console.log('');
    
    // Test 4: Test password reset request
    console.log('4. Testing password reset request...');
    const resetResponse = await axios.post(`${baseURL}/auth/request-password-reset`, {
      email: 'admin@example.com'
    });
    
    console.log('✅ Password reset request successful!');
    console.log('Response:', resetResponse.data.message);
    console.log('');
    
    console.log('🎉 All encrypted authentication tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n💡 Tip: Make sure the API server is running on port 3033');
    }
    
    if (error.response?.data?.message?.includes('Email not found')) {
      console.log('\n💡 Tip: The test user might not exist. Try registering first or use a different email.');
    }
  }
};

// Run the test
testEncryptedAuth();
