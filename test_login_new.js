const axios = require('axios');

const testLoginAPI = async () => {
  console.log('🧪 Testing Login API...');
  console.log('Target: H0110001 / 11111111');
  console.log('=' * 40);
  
  try {
    // ทดสอบ connection ก่อน
    console.log('\n1. Testing server connection...');
    const healthCheck = await axios.get('http://localhost:3600/api/example/test');
    console.log('✅ Server is running');
    console.log('Health check response:', healthCheck.data);
  } catch (error) {
    console.log('❌ Server connection failed:', error.message);
    return;
  }
  
  // ทดสอบ login-v2
  console.log('\n2. Testing login-v2...');
  try {
    const loginResponse = await axios.post('http://localhost:3600/auth/login-v2', {
      identifier: 'H0110001',
      password: '11111111'
    });
    
    console.log('✅ Login Success!');
    console.log('Response:', JSON.stringify(loginResponse.data, null, 2));
    
  } catch (error) {
    console.log('❌ Login Failed!');
    console.log('Status:', error.response?.status);
    console.log('Response:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.status === 400) {
      console.log('\n🔍 Analyzing 400 error...');
      const errorData = error.response.data;
      if (errorData.error) {
        console.log('Error message:', errorData.error);
        
        if (errorData.error.includes('Invalid') || errorData.error.includes('password')) {
          console.log('💡 This suggests user was found but password is wrong');
        } else if (errorData.error.includes('not found') || errorData.error.includes('email')) {
          console.log('💡 This suggests user was not found');
        }
      }
    }
  }
  
  // ทดสอบ login ธรรมดา
  console.log('\n3. Testing regular login...');
  try {
    const loginResponse = await axios.post('http://localhost:3600/auth/login', {
      email: 'H0110001',  // ทดสอบใส่ใน email field
      password: '11111111'
    });
    
    console.log('✅ Regular Login Success!');
    console.log('Response:', JSON.stringify(loginResponse.data, null, 2));
    
  } catch (error) {
    console.log('❌ Regular Login Failed!');
    console.log('Status:', error.response?.status);
    console.log('Response:', JSON.stringify(error.response?.data, null, 2));
  }
};

testLoginAPI();
