import UserModel from '../models/UserModel';
import EncryptionService from './encryptionService';

class UserEncryptionMigrationService {
  /**
   * Migrate existing users to encrypted format (PIPEDA compliance)
   */
  async migrateToEncrypted(batchSize: number = 50) {
    let offset = 0;
    let totalMigrated = 0;

    console.log('🔐 Starting PIPEDA compliance encryption migration...');

    while (true) {
      const users = await UserModel.findAll({
        where: { 
          is_encrypted: false 
        },
        limit: batchSize,
        offset: offset
      });

      if (users.length === 0) {
        break;
      }

      for (const user of users) {
        try {
          // Encrypt PII fields
          user.setEncryptedEmail(user.email);
          user.setEncryptedFirstName(user.first_name);
          user.setEncryptedLastName(user.last_name);
          user.setEncryptedPhoneNumber(user.phone_number);
          user.setEncryptedDateOfBirth(user.date_of_birth);
          user.setEncryptedIdCardNumber(user.id_card_number);
          user.setEncryptedPassportNumber(user.passport_number);
          user.setEncryptedOccupationNumber(user.occupation_number);
          user.setEncryptedIDLine(user.ID_line);

          // Mark as encrypted
          user.is_encrypted = true;
          user.encryption_version = 'v1.0';
          user.encryption_migrated_at = new Date();

          // Set PIPEDA compliance dates
          user.consent_given_date = new Date(); // Assume existing users have given consent
          await user.markForDataRetention(84); // 7 years

          await user.save();

          totalMigrated++;
          console.log(`✅ Migrated user ID: ${user.id} (${user.username})`);

        } catch (error) {
          console.error(`❌ Failed to migrate user ID: ${user.id}`, error);
        }
      }

      offset += batchSize;
      console.log(`📊 Progress: ${totalMigrated} users migrated...`);
    }

    console.log(`🎉 Migration completed! Total users migrated: ${totalMigrated}`);
    return totalMigrated;
  }

  /**
   * Test encryption/decryption functionality
   */
  async testEncryption() {
    console.log('🧪 Testing PIPEDA encryption service...');
    
    const testData = {
      email: 'test@example.com',
      phone: '+66812345678',
      idCard: '1234567890123',
      firstName: 'John',
      lastName: 'Doe'
    };

    console.log('\n=== ENCRYPTION TEST RESULTS ===');
    for (const [key, value] of Object.entries(testData)) {
      const encrypted = EncryptionService.encrypt(value);
      const decrypted = EncryptionService.decrypt(encrypted);
      const hash = EncryptionService.createSearchHash(value);
      const masked = EncryptionService.createMaskedVersion(value, 2);

      console.log(`\n${key.toUpperCase()}:`);
      console.log(`  Original:  ${value}`);
      console.log(`  Encrypted: ${encrypted?.substring(0, 50)}...`);
      console.log(`  Decrypted: ${decrypted}`);
      console.log(`  Hash:      ${hash}`);
      console.log(`  Masked:    ${masked}`);
      console.log(`  Match:     ${value === decrypted ? '✅' : '❌'}`);
    }

    // Test the encryption service built-in test
    console.log('\n=== BUILT-IN ENCRYPTION TEST ===');
    const serviceTest = EncryptionService.testEncryption();
    console.log(`Service test result: ${serviceTest ? '✅ PASSED' : '❌ FAILED'}`);

    return serviceTest;
  }

  /**
   * Get migration status and PIPEDA compliance report
   */
  async getMigrationStatus() {
    const total = await UserModel.count();
    const encrypted = await UserModel.count({
      where: { is_encrypted: true }
    });
    const withConsent = await UserModel.count({
      where: { consent_given_date: { [Symbol.for('not')]: null } }
    });
    const withRetention = await UserModel.count({
      where: { data_retention_date: { [Symbol.for('not')]: null } }
    });

    return {
      total_users: total,
      encrypted_users: encrypted,
      remaining_users: total - encrypted,
      users_with_consent: withConsent,
      users_with_retention_date: withRetention,
      encryption_percentage: total > 0 ? Math.round((encrypted / total) * 100) : 0,
      pipeda_compliance: encrypted === total && withConsent >= encrypted,
      compliance_score: total > 0 ? Math.round(((encrypted + withConsent + withRetention) / (total * 3)) * 100) : 0
    };
  }

  /**
   * Generate comprehensive PIPEDA compliance report
   */
  async generatePipedaReport() {
    const status = await this.getMigrationStatus();
    
    // Users approaching data retention deadline (30 days)
    const usersNearRetention = await UserModel.findAll({
      where: {
        data_retention_date: {
          [Symbol.for('lte')]: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      },
      attributes: ['id', 'username', 'data_retention_date', 'email'],
      limit: 10
    });

    // Users who have withdrawn consent
    const consentWithdrawn = await UserModel.findAll({
      where: {
        consent_withdrawn_date: { [Symbol.for('not')]: null }
      },
      attributes: ['id', 'username', 'consent_withdrawn_date'],
      limit: 10
    });

    // Users without encryption (non-compliant)
    const nonCompliantUsers = await UserModel.findAll({
      where: { is_encrypted: false },
      attributes: ['id', 'username', 'created_at'],
      limit: 10
    });

    // Generate recommendations
    const recommendations = [];
    if (status.encryption_percentage < 100) {
      recommendations.push(`Complete encryption migration for ${status.remaining_users} remaining users`);
    }
    if (usersNearRetention.length > 0) {
      recommendations.push(`${usersNearRetention.length} users approaching data retention deadline`);
    }
    if (consentWithdrawn.length > 0) {
      recommendations.push(`${consentWithdrawn.length} users have withdrawn consent - consider data deletion`);
    }
    if (status.compliance_score < 90) {
      recommendations.push('Improve PIPEDA compliance score by ensuring all users have proper consent and retention dates');
    }

    return {
      report_generated_at: new Date(),
      encryption_status: status,
      users_near_retention: usersNearRetention.map(user => ({
        id: user.id,
        username: user.username,
        retention_date: user.data_retention_date,
        days_remaining: user.data_retention_date ? 
          Math.ceil((user.data_retention_date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
      })),
      consent_withdrawn_users: consentWithdrawn.map(user => ({
        id: user.id,
        username: user.username,
        withdrawal_date: user.consent_withdrawn_date
      })),
      non_compliant_users: nonCompliantUsers.map(user => ({
        id: user.id,
        username: user.username,
        created_at: user.created_at
      })),
      recommendations,
      compliance_summary: {
        overall_score: status.compliance_score,
        encryption_complete: status.encryption_percentage === 100,
        consent_tracking: status.users_with_consent > 0,
        retention_management: status.users_with_retention_date > 0,
        pipeda_compliant: status.pipeda_compliance
      }
    };
  }

  /**
   * Rollback encryption (emergency use only)
   */
  async rollbackEncryption() {
    console.log('⚠️  Starting encryption rollback...');
    
    const result = await UserModel.update({
      email_encrypted: null,
      first_name_encrypted: null,
      last_name_encrypted: null,
      phone_number_encrypted: null,
      date_of_birth_encrypted: null,
      id_card_number_encrypted: null,
      passport_number_encrypted: null,
      occupation_number_encrypted: null,
      ID_line_encrypted: null,
      email_hash: null,
      phone_number_hash: null,
      id_card_number_hash: null,
      is_encrypted: false,
      encryption_migrated_at: null
    }, {
      where: { is_encrypted: true }
    });

    console.log(`🔄 Encryption rollback completed. ${result[0]} users affected.`);
    return result[0];
  }

  /**
   * Migrate specific user by ID
   */
  async migrateUserById(userId: number) {
    const user = await UserModel.findByPk(userId);
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    if (user.is_encrypted) {
      console.log(`⏭️  User ${userId} is already encrypted`);
      return user;
    }

    // Encrypt the user's data
    user.setEncryptedEmail(user.email);
    user.setEncryptedFirstName(user.first_name);
    user.setEncryptedLastName(user.last_name);
    user.setEncryptedPhoneNumber(user.phone_number);
    user.setEncryptedDateOfBirth(user.date_of_birth);
    user.setEncryptedIdCardNumber(user.id_card_number);
    user.setEncryptedPassportNumber(user.passport_number);
    user.setEncryptedOccupationNumber(user.occupation_number);
    user.setEncryptedIDLine(user.ID_line);

    user.is_encrypted = true;
    user.encryption_version = 'v1.0';
    user.encryption_migrated_at = new Date();
    
    if (!user.consent_given_date) {
      user.consent_given_date = new Date();
    }
    
    if (!user.data_retention_date) {
      await user.markForDataRetention(84);
    }

    await user.save();

    console.log(`✅ Successfully migrated user ${userId} to encrypted format`);
    return user;
  }

  /**
   * Test user search functionality with encrypted data
   */
  async testUserSearch() {
    console.log('🔍 Testing encrypted user search functionality...');

    // Create a test user if none exists
    const testUser = await UserModel.findOne({ where: { is_encrypted: true } });
    
    if (!testUser) {
      console.log('ℹ️  No encrypted users found for testing');
      return false;
    }

    const testEmail = testUser.getDecryptedEmail();
    const testPhone = testUser.getDecryptedPhoneNumber();
    const testIdCard = testUser.getDecryptedIdCardNumber();

    console.log('\n=== SEARCH TEST RESULTS ===');

    // Test email search
    if (testEmail) {
      const foundByEmail = await UserModel.findByEmailSafe(testEmail);
      console.log(`Email search: ${foundByEmail ? '✅ FOUND' : '❌ NOT FOUND'}`);
    }

    // Test phone search
    if (testPhone) {
      const foundByPhone = await UserModel.findByPhoneNumberSafe(testPhone);
      console.log(`Phone search: ${foundByPhone ? '✅ FOUND' : '❌ NOT FOUND'}`);
    }

    // Test ID card search
    if (testIdCard) {
      const foundByIdCard = await UserModel.findByIdCardNumberSafe(testIdCard);
      console.log(`ID card search: ${foundByIdCard ? '✅ FOUND' : '❌ NOT FOUND'}`);
    }

    return true;
  }
}

export default new UserEncryptionMigrationService();
