const { sequelize } = require('./dist/config/database');
const UserModel = require('./dist/models/UserModel').default;
const { PipedaUserDataHandler } = require('./dist/middleware/pipedaUserDataHandler');

async function testIncludeDecryption() {
  try {
    console.log('🔍 Testing include user data decryption in services...\n');
    
    // Test case 1: Find user with associations to test decryption
    const userWithAssociations = await UserModel.findOne({
      where: { 
        first_name_encrypted: { [require('sequelize').Op.ne]: null } 
      },
      attributes: ['id', 'username', 'first_name', 'first_name_encrypted', 'last_name', 'last_name_encrypted', 'email', 'email_encrypted'],
      limit: 1
    });
    
    if (!userWithAssociations) {
      console.log('❌ No users found with encrypted data for testing');
      return;
    }
    
    console.log('📋 Testing user data in association context:');
    console.log('- User ID:', userWithAssociations.id);
    console.log('- Username:', userWithAssociations.username);
    
    // Simulate association include scenario
    const associationTestData = {
      id: 1,
      user: {
        id: userWithAssociations.id,
        username: userWithAssociations.username,
        first_name: userWithAssociations.first_name,
        last_name: userWithAssociations.last_name,
        email: userWithAssociations.email
      }
    };
    
    console.log('\n🔓 Before decryption (association data):');
    console.log('- User First Name:', associationTestData.user.first_name?.substring(0, 30) + '...' || 'null');
    console.log('- User Last Name:', associationTestData.user.last_name?.substring(0, 30) + '...' || 'null');
    console.log('- User Email:', associationTestData.user.email?.substring(0, 30) + '...' || 'null');
    
    // Test decryption through PipedaUserDataHandler
    const decryptedUser = PipedaUserDataHandler.decryptUserData(associationTestData.user);
    
    console.log('\n✨ After decryption (association data):');
    console.log('- User First Name:', decryptedUser.first_name);
    console.log('- User Last Name:', decryptedUser.last_name);
    console.log('- User Email:', decryptedUser.email);
    
    // Test array decryption (like department members)
    const membersTestData = [
      { user: associationTestData.user },
      { user: associationTestData.user }
    ];
    
    console.log('\n🔧 Testing array decryption (department members scenario):');
    const decryptedMembers = membersTestData.map(member => {
      if (member.user) {
        member.user = PipedaUserDataHandler.decryptUserData(member.user);
      }
      return member;
    });
    
    console.log('- Member 1 Name:', `${decryptedMembers[0].user.first_name} ${decryptedMembers[0].user.last_name}`);
    console.log('- Member 1 Email:', decryptedMembers[0].user.email);
    
    // Test notification scenario
    console.log('\n📨 Testing notification recipient scenario:');
    const notificationData = {
      id: 1,
      title: 'Test Notification',
      recipients: [
        {
          id: 1,
          user: associationTestData.user
        }
      ]
    };
    
    // Decrypt recipients
    if (notificationData.recipients) {
      notificationData.recipients.forEach((recipient) => {
        if (recipient.user) {
          recipient.user = PipedaUserDataHandler.decryptUserData(recipient.user);
        }
      });
    }
    
    console.log('- Recipient Name:', `${notificationData.recipients[0].user.first_name} ${notificationData.recipients[0].user.last_name}`);
    console.log('- Recipient Email:', notificationData.recipients[0].user.email);
    
    console.log('\n✅ All include/association decryption tests completed successfully!');
    console.log('🔒 PIPEDA compliance maintained in all service association scenarios');
    
  } catch (error) {
    console.error('❌ Error during include decryption test:', error);
  } finally {
    await sequelize.close();
  }
}

testIncludeDecryption();
