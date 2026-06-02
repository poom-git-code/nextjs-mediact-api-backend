// Service to transition from plain text to encrypted-only storage
const UserModel = require('./dist/models/UserModel').default;
const pipedaEncryptionService = require('./dist/services/pipedaEncryptionService').default;
const { Op } = require('sequelize');

class TransitionToEncryptedOnlyService {
  // Clear plain text fields after confirming encrypted data exists
  async clearPlainTextFields(userId = null) {
    console.log('🔒 Starting transition to encrypted-only storage...');
    
    const whereClause = {
      is_encrypted: true,
      // Ensure all PII fields are encrypted
      email_encrypted: { [Op.ne]: null },
      first_name_encrypted: { [Op.ne]: null },
      last_name_encrypted: { [Op.ne]: null },
      phone_number_encrypted: { [Op.ne]: null },
      // Only process users who still have plain text data
      [Op.or]: [
        { email: { [Op.ne]: null } },
        { first_name: { [Op.ne]: null } },
        { last_name: { [Op.ne]: null } },
        { phone_number: { [Op.ne]: null } }
      ]
    };

    if (userId) {
      whereClause.id = userId;
    }

    try {
      // Get users that have encrypted data
      const users = await UserModel.findAll({
        where: whereClause,
        raw: true
      });

      console.log(`Found ${users.length} users with complete encrypted data`);

      let processedCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          // Verify encrypted data can be decrypted
          const decryptedEmail = pipedaEncryptionService.decrypt(user.email_encrypted);
          const decryptedFirstName = pipedaEncryptionService.decrypt(user.first_name_encrypted);
          
          if (decryptedEmail && decryptedFirstName) {
            // Clear plain text fields
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

            processedCount++;
            console.log(`✅ Cleared plain text for user ${user.id}`);
          } else {
            console.log(`⚠️ Cannot decrypt data for user ${user.id}, skipping`);
            errorCount++;
          }
        } catch (error) {
          console.error(`❌ Error processing user ${user.id}:`, error.message);
          errorCount++;
        }
      }

      return {
        total_processed: processedCount,
        errors: errorCount,
        message: `Successfully transitioned ${processedCount} users to encrypted-only storage`
      };

    } catch (error) {
      console.error('❌ Transition failed:', error);
      throw error;
    }
  }

  // Verify transition status
  async verifyTransition() {
    console.log('🔍 Verifying transition to encrypted-only storage...');

    try {
      const users = await UserModel.findAll({
        where: { is_encrypted: true },
        attributes: [
          'id', 'email', 'first_name', 'last_name', 'phone_number',
          'email_encrypted', 'first_name_encrypted', 'last_name_encrypted', 
          'phone_number_encrypted', 'is_encrypted'
        ],
        raw: true
      });

      let plainTextCount = 0;
      let encryptedOnlyCount = 0;

      for (const user of users) {
        const hasPlainText = user.email || user.first_name || user.last_name || user.phone_number;
        const hasEncrypted = user.email_encrypted && user.first_name_encrypted;

        if (hasPlainText) {
          plainTextCount++;
        } else if (hasEncrypted) {
          encryptedOnlyCount++;
        }
      }

      console.log('\n📊 Transition Status:');
      console.log(`- Users with plain text: ${plainTextCount}`);
      console.log(`- Users encrypted-only: ${encryptedOnlyCount}`);
      console.log(`- Total encrypted users: ${users.length}`);
      
      const isComplete = plainTextCount === 0;
      console.log(`- Transition complete: ${isComplete ? '✅ YES' : '❌ NO'}`);

      return {
        plain_text_users: plainTextCount,
        encrypted_only_users: encryptedOnlyCount,
        total_users: users.length,
        transition_complete: isComplete
      };

    } catch (error) {
      console.error('❌ Verification failed:', error);
      throw error;
    }
  }

  // Test a specific user's encrypted data
  async testUserDecryption(userId) {
    console.log(`🧪 Testing decryption for user ${userId}...`);

    try {
      const user = await UserModel.findOne({
        where: { id: userId },
        raw: true
      });

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      const results = {};

      // Test decryption of all encrypted fields
      if (user.email_encrypted) {
        results.email = pipedaEncryptionService.decrypt(user.email_encrypted);
      }
      if (user.first_name_encrypted) {
        results.first_name = pipedaEncryptionService.decrypt(user.first_name_encrypted);
      }
      if (user.last_name_encrypted) {
        results.last_name = pipedaEncryptionService.decrypt(user.last_name_encrypted);
      }
      if (user.phone_number_encrypted) {
        results.phone_number = pipedaEncryptionService.decrypt(user.phone_number_encrypted);
      }

      console.log('Decrypted data:', results);
      return results;

    } catch (error) {
      console.error(`❌ Test failed for user ${userId}:`, error);
      throw error;
    }
  }
}

const transitionService = new TransitionToEncryptedOnlyService();

// Export for use
module.exports = transitionService;

// Run if called directly
if (require.main === module) {
  async function runTransition() {
    try {
      // First verify current status
      await transitionService.verifyTransition();
      
      console.log('\n🚀 Starting transition to encrypted-only storage...');
      const result = await transitionService.clearPlainTextFields();
      console.log('\n✅ Transition Result:', result);
      
      // Verify after transition
      console.log('\n🔍 Post-transition verification...');
      await transitionService.verifyTransition();
      
    } catch (error) {
      console.error('💥 Transition failed:', error);
    }
  }

  runTransition();
}
