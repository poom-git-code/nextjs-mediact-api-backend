// Test new user registration with PIPEDA encryption
const authService = require('./dist/services/authService');

async function testNewUserRegistration() {
  console.log('🧪 Testing New User Registration with PIPEDA Encryption\n');

  try {
    // Test data for new user
    const testUserData = {
      username: `testpipeda${Date.now()}`,
      email: `testpipeda${Date.now()}@test.com`,
      password: 'TestPassword123!',
      first_name: 'Test',
      last_name: 'PIPEDA',
      phone_number: '0999999999',
      gender_id: 1,
      role_id: 1
    };

    console.log('📝 Creating new user with data:');
    console.log('- Username:', testUserData.username);
    console.log('- Email:', testUserData.email);
    console.log('- First Name:', testUserData.first_name);
    console.log('- Last Name:', testUserData.last_name);
    console.log('- Phone:', testUserData.phone_number);

    // Register new user
    const newUser = await authService.registerUser(
      testUserData.email,
      testUserData.password,
      testUserData.username,
      testUserData.first_name,
      testUserData.last_name,
      testUserData.phone_number,
      testUserData.gender_id,
      testUserData.role_id
    );

    console.log('\n✅ User created successfully!');
    console.log('User ID:', newUser.id);

    // Check the database directly to see if it's encrypted
    const UserModel = require('./dist/models/UserModel').default;
    const dbUser = await UserModel.findOne({
      where: { id: newUser.id },
      raw: true
    });

    console.log('\n📊 Database Storage Check:');
    console.log('- email (plain):', dbUser.email || '[NULL]');
    console.log('- first_name (plain):', dbUser.first_name || '[NULL]');
    console.log('- last_name (plain):', dbUser.last_name || '[NULL]');
    console.log('- phone_number (plain):', dbUser.phone_number || '[NULL]');
    console.log('- email_encrypted:', dbUser.email_encrypted ? '***ENCRYPTED***' : '[NULL]');
    console.log('- first_name_encrypted:', dbUser.first_name_encrypted ? '***ENCRYPTED***' : '[NULL]');
    console.log('- last_name_encrypted:', dbUser.last_name_encrypted ? '***ENCRYPTED***' : '[NULL]');
    console.log('- phone_number_encrypted:', dbUser.phone_number_encrypted ? '***ENCRYPTED***' : '[NULL]');
    console.log('- is_encrypted:', dbUser.is_encrypted || false);

    console.log('\n🎯 Encryption Status:');
    const isProperlyEncrypted = dbUser.email_encrypted && 
                                dbUser.first_name_encrypted && 
                                dbUser.last_name_encrypted && 
                                dbUser.phone_number_encrypted &&
                                dbUser.is_encrypted &&
                                !dbUser.email &&
                                !dbUser.first_name &&
                                !dbUser.last_name &&
                                !dbUser.phone_number;

    if (isProperlyEncrypted) {
      console.log('✅ User is properly encrypted!');
      console.log('✅ PIPEDA compliance: SUCCESS');
    } else {
      console.log('❌ User is NOT properly encrypted!');
      console.log('❌ PIPEDA compliance: FAILED');
      
      console.log('\n🔧 Issues detected:');
      if (!dbUser.email_encrypted) console.log('- Missing email encryption');
      if (!dbUser.first_name_encrypted) console.log('- Missing first_name encryption');
      if (!dbUser.last_name_encrypted) console.log('- Missing last_name encryption');
      if (!dbUser.phone_number_encrypted) console.log('- Missing phone_number encryption');
      if (!dbUser.is_encrypted) console.log('- Missing is_encrypted flag');
      if (dbUser.email) console.log('- Plain text email still present');
      if (dbUser.first_name) console.log('- Plain text first_name still present');
      if (dbUser.last_name) console.log('- Plain text last_name still present');
      if (dbUser.phone_number) console.log('- Plain text phone_number still present');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testNewUserRegistration().then(() => {
    console.log('\n🏁 New user registration test completed');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
}

module.exports = { testNewUserRegistration };
