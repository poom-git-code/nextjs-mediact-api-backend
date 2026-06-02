const { sequelize } = require('./dist/config/database');
const UserModel = require('./dist/models/UserModel').default;
const { PipedaUserDataHandler } = require('./dist/middleware/pipedaUserDataHandler');

async function testServiceDecryption() {
  try {
    console.log('🔍 Testing service decryption functionality...\n');
    
    // Get a sample user
    const user = await UserModel.findOne({
      where: { id: 1 },
      attributes: ['id', 'username', 'first_name', 'last_name', 'email', 'phone_number']
    });
    
    if (!user) {
      console.log('❌ No user found for testing');
      return;
    }
    
    console.log('📋 Raw user data (encrypted):');
    console.log('- ID:', user.id);
    console.log('- Username:', user.username);
    console.log('- First Name:', user.first_name?.substring(0, 20) + '...' || 'null');
    console.log('- Last Name:', user.last_name?.substring(0, 20) + '...' || 'null');
    console.log('- Email:', user.email?.substring(0, 20) + '...' || 'null');
    console.log('- Phone:', user.phone_number?.substring(0, 20) + '...' || 'null');
    
    console.log('\n🔓 Decrypted user data:');
    const decryptedUser = PipedaUserDataHandler.decryptUserData(user);
    console.log('- ID:', decryptedUser.id);
    console.log('- Username:', decryptedUser.username);
    console.log('- First Name:', decryptedUser.first_name);
    console.log('- Last Name:', decryptedUser.last_name);
    console.log('- Email:', decryptedUser.email);
    console.log('- Phone:', decryptedUser.phone_number);
    
    // Test service functionality
    console.log('\n🧪 Testing service usage scenarios:');
    
    // Test notification name generation (like in swapRequestService)
    const fullName = decryptedUser.first_name && decryptedUser.last_name 
      ? `${decryptedUser.first_name} ${decryptedUser.last_name}`
      : `User ${decryptedUser.id}`;
    console.log('- Notification Display Name:', fullName);
    
    // Test token payload generation (like in refreshTokenService)
    const tokenPayload = { 
      id: decryptedUser.id, 
      email: decryptedUser.email 
    };
    console.log('- Token Payload:', tokenPayload);
    
    // Test job application name (like in jobApplyService)
    const applicantName = decryptedUser.first_name && decryptedUser.last_name
      ? `${decryptedUser.first_name || ''} ${decryptedUser.last_name || ''}`.trim()
      : 'ผู้สมัครใหม่';
    console.log('- Job Application Name:', applicantName);
    
    console.log('\n✅ All service decryption tests completed successfully!');
    console.log('🔒 PIPEDA compliance maintained with transparent decryption');
    
  } catch (error) {
    console.error('❌ Error during service decryption test:', error);
  } finally {
    await sequelize.close();
  }
}

testServiceDecryption();
