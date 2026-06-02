const axios = require('axios');

const testLogin = async () => {
  const baseURL = 'http://localhost:3600'; // หรือ port ที่ใช้งาน
  
  console.log('🔍 Testing login with identifier: H0110001');
  console.log('================================');
  
  try {
    // ทดสอบ login-v2 endpoint
    console.log('\n1. ทดสอบ /auth/login-v2');
    const response1 = await axios.post(`${baseURL}/auth/login-v2`, {
      identifier: "H0110001",
      password: "11111111"
    });
    
    console.log('✅ Login V2 Success:', {
      success: response1.data.success || 'no success field',
      userId: response1.data.user?.id,
      username: response1.data.user?.username,
      email: response1.data.user?.email,
      token: response1.data.token ? 'Token received' : 'No token'
    });
    
  } catch (error1) {
    console.log('❌ Login V2 Failed:');
    console.log('Status:', error1.response?.status);
    console.log('Error:', error1.response?.data || error1.message);
  }
  
  try {
    // ทดสอบ backend login endpoint
    console.log('\n2. ทดสอบ backend login');
    const response2 = await axios.post(`${baseURL}/auth/backend-login`, {
      identifier: "H0110001",
      password: "11111111"
    });
    
    console.log('✅ Backend Login Success:', {
      success: response2.data.success || 'no success field',
      userId: response2.data.user?.id,
      username: response2.data.user?.username,
      email: response2.data.user?.email,
      token: response2.data.token ? 'Token received' : 'No token'
    });
    
  } catch (error2) {
    console.log('❌ Backend Login Failed:');
    console.log('Status:', error2.response?.status);
    console.log('Error:', error2.response?.data || error2.message);
  }
  
  // ทดสอบการค้นหา user ในฐานข้อมูล
  console.log('\n3. ทดสอบการค้นหา user โดยตรง');
  try {
    // เรียกใช้ API เพื่อค้นหา user (ถ้ามี endpoint)
    const response3 = await axios.get(`${baseURL}/users?search=H0110001`, {
      headers: {
        'Authorization': 'Bearer your_token_here' // ใส่ token ถ้าจำเป็น
      }
    });
    
    console.log('✅ User Search Success:', response3.data);
    
  } catch (error3) {
    console.log('❌ User Search Failed (might need authentication):', error3.response?.status);
  }
  
  console.log('\n🔍 Debug Information:');
  console.log('- Identifier being tested: H0110001');
  console.log('- Password being tested: 11111111');
  console.log('- Expected: Username field match (not email)');
  console.log('- Check if user exists in database');
  console.log('- Check if password hash matches');
  console.log('- Check if user status_id = 1 (active)');
};

// เรียกใช้ function
testLogin().catch(console.error);
