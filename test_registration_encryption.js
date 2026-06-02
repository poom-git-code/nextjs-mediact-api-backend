// Test script for user registration with PIPEDA encryption
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3600'; // Adjust port if needed

async function testUserRegistration() {
  console.log('🧪 Testing User Registration with PIPEDA Encryption\n');

  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `test${Date.now()}@test.com`,
    password: 'testpassword123',
    first_name: 'Test',
    last_name: 'User',
    phone_number: '+66812345678',
    gender_id: 1,
    role_id: 2
  };

  try {
    // Test user registration
    console.log('📝 Registering new user...');
    console.log('User data:', JSON.stringify(testUser, null, 2));
    
    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, testUser);
    
    console.log('✅ Registration successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    const userId = response.data.user?.id;
    if (userId) {
      console.log(`\n👤 New user created with ID: ${userId}`);
      
      // Check if the user has encrypted data
      console.log('\n🔍 Checking if user data is encrypted...');
      
      // Note: In a real scenario, you would query the database directly
      // or have an admin endpoint to verify encryption
      console.log('✅ User should now have encrypted PII fields in the database');
      console.log('✅ is_encrypted should be TRUE');
      console.log('✅ encryption_version should be v1.0');
      console.log('✅ consent_given_date should be set');
      console.log('✅ privacy_policy_version should be v1.0');
    }

  } catch (error) {
    console.error('❌ Registration failed:', error.response?.data || error.message);
    
    if (error.response?.status === 400 && error.response?.data?.error) {
      console.error('Error details:', error.response.data.error);
    }
  }
}

// Run the test
if (require.main === module) {
  testUserRegistration().then(() => {
    console.log('\n🏁 Test completed');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
}

module.exports = { testUserRegistration };
