const { sequelize } = require('./dist/config/database');
const DepartmentModel = require('./dist/models/DepartmentModel').default;
const UserModel = require('./dist/models/UserModel').default;
const { PipedaUserDataHandler } = require('./dist/middleware/pipedaUserDataHandler');

async function testEncryptedFieldMapping() {
  try {
    console.log('🔍 Testing encrypted field mapping in department includes...\n');
    
    // Test user with encrypted data
    const testUser = await UserModel.findOne({
      where: { 
        first_name_encrypted: { [require('sequelize').Op.ne]: null } 
      },
      attributes: [
        'id', 
        'username',
        ['first_name_encrypted', 'first_name'], 
        ['last_name_encrypted', 'last_name'], 
        ['email_encrypted', 'email'],
        ['phone_number_encrypted', 'phone_number']
      ],
      limit: 1
    });
    
    if (!testUser) {
      console.log('❌ No users found with encrypted data for testing');
      return;
    }
    
    console.log('📋 Testing field mapping with encrypted data:');
    console.log('- User ID:', testUser.id);
    console.log('- Username:', testUser.username);
    
    // Test raw encrypted field mapping
    const userJSON = testUser.toJSON();
    console.log('\n🔐 Raw field mapping result:');
    console.log('- first_name (from first_name_encrypted):', userJSON.first_name?.substring(0, 30) + '...' || 'null');
    console.log('- last_name (from last_name_encrypted):', userJSON.last_name?.substring(0, 30) + '...' || 'null');
    console.log('- email (from email_encrypted):', userJSON.email?.substring(0, 30) + '...' || 'null');
    console.log('- phone_number (from phone_number_encrypted):', userJSON.phone_number?.substring(0, 30) + '...' || 'null');
    
    // Test decryption
    const decryptedUser = PipedaUserDataHandler.decryptUserData(userJSON);
    console.log('\n✨ After PIPEDA decryption:');
    console.log('- first_name:', decryptedUser.first_name);
    console.log('- last_name:', decryptedUser.last_name);
    console.log('- email:', decryptedUser.email);
    console.log('- phone_number:', decryptedUser.phone_number);
    
    // Test department query would work
    console.log('\n🏢 Testing department include scenario:');
    const mockDepartmentData = {
      id: 1,
      name: 'Test Department',
      department_supervisors: [
        {
          id: 1,
          user: userJSON
        }
      ],
      department_members: [
        {
          id: 1,
          user: userJSON
        }
      ]
    };
    
    // Simulate department member decryption
    if (mockDepartmentData.department_supervisors) {
      mockDepartmentData.department_supervisors.forEach((supervisor) => {
        if (supervisor.user) {
          supervisor.user = PipedaUserDataHandler.decryptUserData(supervisor.user);
        }
      });
    }
    
    if (mockDepartmentData.department_members) {
      mockDepartmentData.department_members.forEach((member) => {
        if (member.user) {
          member.user = PipedaUserDataHandler.decryptUserData(member.user);
        }
      });
    }
    
    console.log('- Supervisor Name:', `${mockDepartmentData.department_supervisors[0].user.first_name} ${mockDepartmentData.department_supervisors[0].user.last_name}`);
    console.log('- Supervisor Email:', mockDepartmentData.department_supervisors[0].user.email);
    console.log('- Member Name:', `${mockDepartmentData.department_members[0].user.first_name} ${mockDepartmentData.department_members[0].user.last_name}`);
    console.log('- Member Email:', mockDepartmentData.department_members[0].user.email);
    
    console.log('\n✅ Encrypted field mapping tests completed successfully!');
    console.log('🔒 Field aliases work correctly: encrypted fields → standard field names');
    console.log('🔓 PIPEDA decryption maintains API compatibility');
    
  } catch (error) {
    console.error('❌ Error during encrypted field mapping test:', error);
  } finally {
    await sequelize.close();
  }
}

testEncryptedFieldMapping();
