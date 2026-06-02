import UserModel from '../models/UserModel';
import PipedaEncryptionService from './pipedaEncryptionService';
import AuditService from './auditService';

class UserPipedaMigrationService {
  /**
   * Migrate existing users to encrypted format
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
          const encryptedData = {
            // Encrypt PII fields
            email_encrypted: PipedaEncryptionService.encrypt(user.email),
            first_name_encrypted: PipedaEncryptionService.encrypt(user.first_name),
            last_name_encrypted: PipedaEncryptionService.encrypt(user.last_name),
            phone_number_encrypted: PipedaEncryptionService.encrypt(user.phone_number),
            date_of_birth_encrypted: PipedaEncryptionService.encryptDate(user.date_of_birth),
            id_card_number_encrypted: PipedaEncryptionService.encrypt(user.id_card_number),
            passport_number_encrypted: PipedaEncryptionService.encrypt(user.passport_number),
            occupation_number_encrypted: PipedaEncryptionService.encrypt(user.occupation_number),
            ID_line_encrypted: PipedaEncryptionService.encrypt(user.ID_line),

            // Create search hashes
            email_hash: PipedaEncryptionService.createSearchHash(user.email),
            phone_number_hash: PipedaEncryptionService.createSearchHash(user.phone_number),
            id_card_number_hash: PipedaEncryptionService.createSearchHash(user.id_card_number),

            // Mark as encrypted
            is_encrypted: true,
            encryption_version: 'v1.0',

            // Set PIPEDA compliance dates
            consent_given_date: new Date(), // Assume existing users have given consent
            data_retention_date: this.calculateRetentionDate(7) // 7 years from now
          };

          await user.update(encryptedData);

          // Log migration in audit trail
          await AuditService.log({
            userId: 1, // System user
            action: 'PIPEDA_ENCRYPT',
            tableName: 'users',
            recordId: user.id,
            newValues: {
              sensitive_fields_encrypted: ['email', 'first_name', 'last_name', 'phone_number', 'id_card_number'],
              reason: 'PIPEDA compliance encryption migration',
              encryption_version: 'v1.0'
            }
          });

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
   * Test encryption/decryption
   */
  async testEncryption() {
    console.log('🧪 Testing PIPEDA encryption service...');
    
    const testData = {
      email: 'test@example.com',
      phone: '+66812345678',
      idCard: '1234567890123',
      name: 'John Doe'
    };

    for (const [key, value] of Object.entries(testData)) {
      const encrypted = PipedaEncryptionService.encrypt(value);
      const decrypted = PipedaEncryptionService.decrypt(encrypted);
      const hash = PipedaEncryptionService.createSearchHash(value);
      const masked = PipedaEncryptionService.createMaskedVersion(value, 2);

      console.log(`\n${key.toUpperCase()}:`);
      console.log(`  Original:  ${value}`);
      console.log(`  Encrypted: ${encrypted?.substring(0, 50)}...`);
      console.log(`  Decrypted: ${decrypted}`);
      console.log(`  Hash:      ${hash}`);
      console.log(`  Masked:    ${masked}`);
      console.log(`  Match:     ${value === decrypted ? '✅' : '❌'}`);
    }
  }

  /**
   * Get migration status
   */
  async getMigrationStatus() {
    const total = await UserModel.count();
    const encrypted = await UserModel.count({
      where: { is_encrypted: true }
    });

    return {
      total_users: total,
      encrypted_users: encrypted,
      remaining_users: total - encrypted,
      encryption_percentage: total > 0 ? Math.round((encrypted / total) * 100) : 0,
      pipeda_compliance: encrypted === total
    };
  }

  /**
   * Generate PIPEDA compliance report
   */
  async generatePipedaReport() {
    const status = await this.getMigrationStatus();
    
    const recommendations = [];
    
    if (status.encryption_percentage < 100) {
      recommendations.push(`Complete encryption migration for remaining ${status.remaining_users} users`);
    } else {
      recommendations.push('System is fully PIPEDA compliant');
    }

    return {
      report_generated_at: new Date(),
      encryption_status: status,
      recommendations: recommendations,
      compliance_score: status.encryption_percentage
    };
  }

  /**
   * Helper methods
   */
  private calculateRetentionDate(years: number): Date {
    const date = new Date();
    date.setFullYear(date.getFullYear() + years);
    return date;
  }
}

export default new UserPipedaMigrationService();
