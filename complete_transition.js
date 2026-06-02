// Complete transition script that handles both migration and clearing
const UserModel = require('./dist/models/UserModel').default;
const pipedaEncryptionService = require('./dist/services/pipedaEncryptionService').default;
const { Op } = require('sequelize');

class CompleteTransitionService {
  // First, ensure all users have encrypted data
  async ensureAllUsersEncrypted() {
    console.log('🔍 Ensuring all users have encrypted data...');
    
    const usersWithoutEncryption = await UserModel.findAll({
      where: {
        [Op.or]: [
          { is_encrypted: false },
          { email_encrypted: null },
          { first_name_encrypted: null }
        ]
      },
      raw: true
    });

    console.log(`Found ${usersWithoutEncryption.length} users needing encryption...`);

    let processedCount = 0;
    for (const user of usersWithoutEncryption) {
      try {
        const updateData = {
          email_encrypted: pipedaEncryptionService.encrypt(user.email),
          first_name_encrypted: pipedaEncryptionService.encrypt(user.first_name),
          last_name_encrypted: pipedaEncryptionService.encrypt(user.last_name),
          phone_number_encrypted: pipedaEncryptionService.encrypt(user.phone_number),
          email_hash: pipedaEncryptionService.createSearchHash(user.email),
          phone_number_hash: pipedaEncryptionService.createSearchHash(user.phone_number),
          is_encrypted: true,
          encryption_version: 'v1.0',
          updated_at: new Date()
        };

        await UserModel.update(updateData, {
          where: { id: user.id }
        });

        processedCount++;
        console.log(`✅ Encrypted user ${user.id}`);
      } catch (error) {
        console.error(`❌ Error encrypting user ${user.id}:`, error.message);
      }
    }

    return processedCount;
  }

  // Then, clear plain text data
  async clearAllPlainTextData() {
    console.log('🔒 Clearing all plain text data...');
    
    const usersWithPlainText = await UserModel.findAll({
      where: {
        is_encrypted: true,
        [Op.or]: [
          { email: { [Op.ne]: null } },
          { first_name: { [Op.ne]: null } },
          { last_name: { [Op.ne]: null } },
          { phone_number: { [Op.ne]: null } }
        ]
      },
      raw: true
    });

    console.log(`Found ${usersWithPlainText.length} users with plain text data to clear...`);

    let clearedCount = 0;
    for (const user of usersWithPlainText) {
      try {
        await UserModel.update({
          email: null,
          first_name: null,
          last_name: null,
          phone_number: null,
          national_id: null,
          address: null,
          emergency_contact: null,
          emergency_phone: null,
          updated_at: new Date()
        }, {
          where: { id: user.id }
        });

        clearedCount++;
        console.log(`✅ Cleared plain text for user ${user.id}`);
      } catch (error) {
        console.error(`❌ Error clearing user ${user.id}:`, error.message);
      }
    }

    return clearedCount;
  }

  // Complete transition
  async performCompleteTransition() {
    console.log('🚀 Starting complete transition to encrypted-only storage...\n');
    
    try {
      // Step 1: Ensure encryption
      const encryptedCount = await this.ensureAllUsersEncrypted();
      console.log(`\n📊 Encryption phase: ${encryptedCount} users encrypted\n`);
      
      // Step 2: Clear plain text
      const clearedCount = await this.clearAllPlainTextData();
      console.log(`\n📊 Clearing phase: ${clearedCount} users cleared\n`);
      
      // Step 3: Verify results
      await this.verifyTransition();
      
      return {
        encrypted_users: encryptedCount,
        cleared_users: clearedCount,
        success: true
      };
      
    } catch (error) {
      console.error('💥 Complete transition failed:', error);
      throw error;
    }
  }

  // Verify final state
  async verifyTransition() {
    console.log('🔍 Final verification...');

    const totalUsers = await UserModel.count();
    const encryptedUsers = await UserModel.count({
      where: { is_encrypted: true }
    });
    
    const usersWithPlainText = await UserModel.count({
      where: {
        [Op.or]: [
          { email: { [Op.ne]: null } },
          { first_name: { [Op.ne]: null } },
          { last_name: { [Op.ne]: null } },
          { phone_number: { [Op.ne]: null } }
        ]
      }
    });

    const encryptedOnlyUsers = await UserModel.count({
      where: {
        is_encrypted: true,
        email: null,
        first_name: null,
        last_name: null,
        phone_number: null
      }
    });

    console.log('\n📊 Final Status:');
    console.log(`- Total users: ${totalUsers}`);
    console.log(`- Encrypted users: ${encryptedUsers}`);
    console.log(`- Users with plain text: ${usersWithPlainText}`);
    console.log(`- Encrypted-only users: ${encryptedOnlyUsers}`);
    console.log(`- Transition complete: ${usersWithPlainText === 0 ? '✅ YES' : '❌ NO'}`);
    console.log(`- PIPEDA compliance: ${usersWithPlainText === 0 && encryptedUsers === totalUsers ? '✅ 100%' : '❌ Incomplete'}`);

    return {
      total_users: totalUsers,
      encrypted_users: encryptedUsers,
      plain_text_users: usersWithPlainText,
      encrypted_only_users: encryptedOnlyUsers,
      transition_complete: usersWithPlainText === 0,
      pipeda_compliant: usersWithPlainText === 0 && encryptedUsers === totalUsers
    };
  }
}

const service = new CompleteTransitionService();

// Export for use
module.exports = service;

// Run if called directly
if (require.main === module) {
  service.performCompleteTransition()
    .then(result => {
      console.log('\n🎉 Complete transition finished!');
      console.log('Result:', result);
    })
    .catch(error => {
      console.error('💥 Transition failed:', error);
      process.exit(1);
    });
}
