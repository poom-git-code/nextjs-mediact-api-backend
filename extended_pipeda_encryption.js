// Extend PIPEDA encryption to additional sensitive fields
const UserModel = require('./dist/models/UserModel').default;
const pipedaEncryptionService = require('./dist/services/pipedaEncryptionService').default;
const { Op } = require('sequelize');

class ExtendedPipedaEncryptionService {
  
  // Encrypt additional sensitive fields that were missed
  async encryptAdditionalSensitiveFields() {
    console.log('🔐 Extending PIPEDA encryption to additional sensitive fields...\n');
    
    try {
      // Find users with additional plain text sensitive data
      const usersWithAdditionalData = await UserModel.findAll({
        where: {
          [Op.or]: [
            { id_card_number: { [Op.ne]: null } },
            { passport_number: { [Op.ne]: null } },
            { occupation_number: { [Op.ne]: null } },
            { ID_line: { [Op.ne]: null } },
            { date_of_birth: { [Op.ne]: null } }
          ]
        },
        raw: true
      });

      console.log(`Found ${usersWithAdditionalData.length} users with additional sensitive data to encrypt`);

      let processedCount = 0;
      let errorCount = 0;

      for (const user of usersWithAdditionalData) {
        try {
          const updateData = {
            updated_at: new Date()
          };

          // Encrypt id_card_number if exists and not already encrypted
          if (user.id_card_number && !user.id_card_number_encrypted) {
            updateData.id_card_number_encrypted = pipedaEncryptionService.encrypt(user.id_card_number);
            updateData.id_card_number_hash = pipedaEncryptionService.createSearchHash(user.id_card_number);
            console.log(`  📝 Encrypting ID card for user ${user.id}`);
          }

          // Encrypt passport_number if exists and not already encrypted
          if (user.passport_number && !user.passport_number_encrypted) {
            updateData.passport_number_encrypted = pipedaEncryptionService.encrypt(user.passport_number);
            console.log(`  📝 Encrypting passport for user ${user.id}`);
          }

          // Encrypt occupation_number if exists and not already encrypted
          if (user.occupation_number && !user.occupation_number_encrypted) {
            updateData.occupation_number_encrypted = pipedaEncryptionService.encrypt(user.occupation_number);
            console.log(`  📝 Encrypting occupation number for user ${user.id}`);
          }

          // Encrypt ID_line if exists and not already encrypted
          if (user.ID_line && !user.ID_line_encrypted) {
            updateData.ID_line_encrypted = pipedaEncryptionService.encrypt(user.ID_line);
            console.log(`  📝 Encrypting LINE ID for user ${user.id}`);
          }

          // Encrypt date_of_birth if exists and not already encrypted
          if (user.date_of_birth && !user.date_of_birth_encrypted) {
            updateData.date_of_birth_encrypted = pipedaEncryptionService.encryptDate(user.date_of_birth);
            console.log(`  📝 Encrypting date of birth for user ${user.id}`);
          }

          // Update the user with encrypted data
          await UserModel.update(updateData, {
            where: { id: user.id }
          });

          processedCount++;
          console.log(`✅ Encrypted additional data for user ${user.id}`);

        } catch (error) {
          console.error(`❌ Error encrypting additional data for user ${user.id}:`, error.message);
          errorCount++;
        }
      }

      return {
        total_processed: processedCount,
        errors: errorCount,
        message: `Successfully encrypted additional sensitive data for ${processedCount} users`
      };

    } catch (error) {
      console.error('❌ Additional encryption failed:', error);
      throw error;
    }
  }

  // Clear additional plain text fields after encryption
  async clearAdditionalPlainTextFields() {
    console.log('🔒 Clearing additional plain text sensitive fields...\n');
    
    try {
      const usersWithAdditionalPlainText = await UserModel.findAll({
        where: {
          [Op.and]: [
            { is_encrypted: true },
            {
              [Op.or]: [
                { id_card_number: { [Op.ne]: null } },
                { passport_number: { [Op.ne]: null } },
                { occupation_number: { [Op.ne]: null } },
                { ID_line: { [Op.ne]: null } },
                { date_of_birth: { [Op.ne]: null } }
              ]
            }
          ]
        },
        raw: true
      });

      console.log(`Found ${usersWithAdditionalPlainText.length} users with additional plain text to clear`);

      let clearedCount = 0;
      let errorCount = 0;

      for (const user of usersWithAdditionalPlainText) {
        try {
          // Only clear fields that have corresponding encrypted versions
          const updateData = {
            updated_at: new Date()
          };

          if (user.id_card_number && user.id_card_number_encrypted) {
            updateData.id_card_number = null;
          }
          if (user.passport_number && user.passport_number_encrypted) {
            updateData.passport_number = null;
          }
          if (user.occupation_number && user.occupation_number_encrypted) {
            updateData.occupation_number = null;
          }
          if (user.ID_line && user.ID_line_encrypted) {
            updateData.ID_line = null;
          }
          if (user.date_of_birth && user.date_of_birth_encrypted) {
            updateData.date_of_birth = null;
          }

          await UserModel.update(updateData, {
            where: { id: user.id }
          });

          clearedCount++;
          console.log(`✅ Cleared additional plain text for user ${user.id}`);

        } catch (error) {
          console.error(`❌ Error clearing additional plain text for user ${user.id}:`, error.message);
          errorCount++;
        }
      }

      return {
        total_cleared: clearedCount,
        errors: errorCount,
        message: `Successfully cleared additional plain text for ${clearedCount} users`
      };

    } catch (error) {
      console.error('❌ Additional clearing failed:', error);
      throw error;
    }
  }

  // Complete additional encryption process
  async performExtendedEncryption() {
    console.log('🚀 Starting Extended PIPEDA Encryption for Additional Fields...\n');
    
    try {
      // Step 1: Encrypt additional fields
      console.log('📐 Phase 1: Encrypting additional sensitive fields...');
      const encryptResult = await this.encryptAdditionalSensitiveFields();
      console.log(`✅ Encryption phase: ${encryptResult.total_processed} users processed\n`);
      
      // Step 2: Clear additional plain text
      console.log('🗑️ Phase 2: Clearing additional plain text fields...');
      const clearResult = await this.clearAdditionalPlainTextFields();
      console.log(`✅ Clearing phase: ${clearResult.total_cleared} users processed\n`);
      
      // Step 3: Final verification
      console.log('🔍 Phase 3: Final verification...');
      await this.verifyExtendedEncryption();
      
      return {
        encrypted_users: encryptResult.total_processed,
        cleared_users: clearResult.total_cleared,
        success: true
      };
      
    } catch (error) {
      console.error('💥 Extended encryption failed:', error);
      throw error;
    }
  }

  // Verify extended encryption status
  async verifyExtendedEncryption() {
    console.log('🔍 Verifying extended PIPEDA encryption...\n');

    try {
      const totalUsers = await UserModel.count();

      // Count users with plain text sensitive data
      const usersWithPlainIdCard = await UserModel.count({
        where: { id_card_number: { [Op.ne]: null } }
      });
      
      const usersWithPlainPassport = await UserModel.count({
        where: { passport_number: { [Op.ne]: null } }
      });
      
      const usersWithPlainOccupation = await UserModel.count({
        where: { occupation_number: { [Op.ne]: null } }
      });
      
      const usersWithPlainIdLine = await UserModel.count({
        where: { ID_line: { [Op.ne]: null } }
      });
      
      const usersWithPlainDob = await UserModel.count({
        where: { date_of_birth: { [Op.ne]: null } }
      });

      const totalPlainTextFields = usersWithPlainIdCard + usersWithPlainPassport + 
                                   usersWithPlainOccupation + usersWithPlainIdLine + usersWithPlainDob;

      console.log('📊 Extended PIPEDA Compliance Status:');
      console.log(`- Total users: ${totalUsers}`);
      console.log(`- Users with plain ID cards: ${usersWithPlainIdCard}`);
      console.log(`- Users with plain passports: ${usersWithPlainPassport}`);
      console.log(`- Users with plain occupation numbers: ${usersWithPlainOccupation}`);
      console.log(`- Users with plain LINE IDs: ${usersWithPlainIdLine}`);
      console.log(`- Users with plain dates of birth: ${usersWithPlainDob}`);
      console.log(`- Total plain text instances: ${totalPlainTextFields}`);
      
      const isFullyCompliant = totalPlainTextFields === 0;
      console.log(`- Extended PIPEDA compliance: ${isFullyCompliant ? '✅ 100%' : '❌ Incomplete'}`);

      if (isFullyCompliant) {
        console.log('\n🎉 All sensitive data fields are now encrypted!');
        console.log('✅ Extended PIPEDA compliance achieved');
      } else {
        console.log('\n⚠️ Some plain text sensitive data remains');
        console.log('❌ Additional encryption needed');
      }

      return {
        total_users: totalUsers,
        plain_text_instances: totalPlainTextFields,
        fully_compliant: isFullyCompliant
      };

    } catch (error) {
      console.error('❌ Extended verification failed:', error);
      throw error;
    }
  }
}

const extendedService = new ExtendedPipedaEncryptionService();

// Export for use
module.exports = extendedService;

// Run if called directly
if (require.main === module) {
  extendedService.performExtendedEncryption()
    .then(result => {
      console.log('\n🎉 Extended PIPEDA encryption completed!');
      console.log('Result:', result);
    })
    .catch(error => {
      console.error('💥 Extended encryption failed:', error);
      process.exit(1);
    });
}
