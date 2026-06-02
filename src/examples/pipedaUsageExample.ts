import UserModel from '../models/UserModel';
import EncryptionService from '../services/encryptionService';
import UserEncryptionMigrationService from '../services/userEncryptionMigrationService';

/**
 * ตัวอย่างการใช้งาน PIPEDA Compliance Encryption System
 */
class PipedaUsageExample {

  /**
   * ตัวอย่าง: สร้าง user ใหม่ด้วยข้อมูลที่เข้ารหัส
   */
  async createEncryptedUser() {
    console.log('📝 Creating new user with encrypted PII data...');

    const newUser = await UserModel.create({
      username: 'john.doe.encrypted',
      password: 'hashed_password_here',
      first_name: 'John', // จะถูกเข้ารหัสใน beforeCreate hook
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone_number: '+1-416-555-1234',
      id_card_number: '1234567890123',
      date_of_birth: new Date('1990-01-01'),
      gender_id: 1,
      status_id: 1
    });

    // เข้ารหัสข้อมูล PII
    newUser.setEncryptedEmail(newUser.email);
    newUser.setEncryptedFirstName(newUser.first_name);
    newUser.setEncryptedLastName(newUser.last_name);
    newUser.setEncryptedPhoneNumber(newUser.phone_number);
    newUser.setEncryptedIdCardNumber(newUser.id_card_number);
    newUser.setEncryptedDateOfBirth(newUser.date_of_birth);

    // ตั้งค่า PIPEDA compliance
    newUser.is_encrypted = true;
    newUser.encryption_version = 'v1.0';
    newUser.encryption_migrated_at = new Date();
    await newUser.recordConsent();
    await newUser.markForDataRetention(84); // 7 years

    await newUser.save();

    console.log('✅ User created with encrypted data:', {
      id: newUser.id,
      username: newUser.username,
      encrypted_email: newUser.email_encrypted?.substring(0, 20) + '...',
      email_hash: newUser.email_hash,
      is_encrypted: newUser.is_encrypted
    });

    return newUser;
  }

  /**
   * ตัวอย่าง: การค้นหา user ด้วยข้อมูลที่เข้ารหัส
   */
  async searchEncryptedUser() {
    console.log('🔍 Searching for users with encrypted data...');

    // ค้นหาด้วย email (จะใช้ hash)
    const userByEmail = await UserModel.findByEmailSafe('john.doe@example.com');
    if (userByEmail) {
      console.log('Found user by email:', {
        id: userByEmail.id,
        username: userByEmail.username,
        decrypted_email: userByEmail.getDecryptedEmail()
      });
    }

    // ค้นหาด้วย phone number (จะใช้ hash)
    const userByPhone = await UserModel.findByPhoneNumberSafe('+1-416-555-1234');
    if (userByPhone) {
      console.log('Found user by phone:', {
        id: userByPhone.id,
        username: userByPhone.username,
        decrypted_phone: userByPhone.getDecryptedPhoneNumber()
      });
    }

    // ค้นหาด้วย ID card (จะใช้ hash)
    const userByIdCard = await UserModel.findByIdCardNumberSafe('1234567890123');
    if (userByIdCard) {
      console.log('Found user by ID card:', {
        id: userByIdCard.id,
        username: userByIdCard.username,
        decrypted_id_card: userByIdCard.getDecryptedIdCardNumber()
      });
    }
  }

  /**
   * ตัวอย่าง: อัปเดตข้อมูล user ที่เข้ารหัส
   */
  async updateEncryptedUser() {
    console.log('✏️  Updating user with encrypted data...');

    const user = await UserModel.findByEmailSafe('john.doe@example.com');
    if (!user) {
      console.log('User not found for update');
      return;
    }

    // อัปเดตข้อมูลใหม่
    const newEmail = 'john.doe.updated@example.com';
    const newPhone = '+1-416-555-9999';

    user.setEncryptedEmail(newEmail);
    user.setEncryptedPhoneNumber(newPhone);

    await user.save();

    console.log('✅ User updated with new encrypted data:', {
      id: user.id,
      old_email_hash: user.email_hash,
      new_decrypted_email: user.getDecryptedEmail(),
      new_decrypted_phone: user.getDecryptedPhoneNumber()
    });
  }

  /**
   * ตัวอย่าง: ส่งออกข้อมูล user แบบ PIPEDA compliant
   */
  async exportUserData() {
    console.log('📤 Exporting user data (PIPEDA compliant)...');

    const user = await UserModel.findByEmailSafe('john.doe.updated@example.com');
    if (!user) {
      console.log('User not found for export');
      return;
    }

    // ส่งออกข้อมูลที่ถอดรหัสแล้ว (สำหรับ API response)
    const decryptedData = user.toPipedaCompliantJSON();
    console.log('Decrypted user data for API:', {
      id: decryptedData.id,
      username: decryptedData.username,
      email: decryptedData.email,
      first_name: decryptedData.first_name,
      last_name: decryptedData.last_name,
      phone_number: decryptedData.phone_number,
      // ข้อมูลที่เข้ารหัสจะถูกซ่อน
      email_encrypted: decryptedData.email_encrypted, // undefined
      encryption_metadata: {
        is_encrypted: decryptedData.is_encrypted,
        encryption_version: decryptedData.encryption_version
      }
    });

    // ส่งออกข้อมูลแบบ masked (สำหรับ logging)
    const maskedData = user.toMaskedJSON();
    console.log('Masked user data for logging:', {
      id: maskedData.id,
      username: maskedData.username,
      email: maskedData.email, // จะเป็น jo***@example.com
      first_name: maskedData.first_name, // จะเป็น J***
      phone_number: maskedData.phone_number // จะเป็น +1-***-9999
    });
  }

  /**
   * ตัวอย่าง: PIPEDA compliance operations
   */
  async pipedaComplianceOperations() {
    console.log('🏛️  Demonstrating PIPEDA compliance operations...');

    const user = await UserModel.findByEmailSafe('john.doe.updated@example.com');
    if (!user) {
      console.log('User not found for compliance operations');
      return;
    }

    // 1. ขยายระยะเวลาเก็บข้อมูล
    await user.markForDataRetention(96); // 8 years
    console.log('✅ Extended data retention period to 8 years');

    // 2. บันทึกการถอนความยินยอม
    await user.recordConsentWithdrawal();
    console.log('✅ Recorded consent withdrawal');

    // 3. ลบข้อมูล PII (Right to be forgotten)
    await user.erasePiiData();
    console.log('✅ Erased PII data per PIPEDA right to be forgotten');

    // ตรวจสอบผลลัพธ์
    await user.reload();
    console.log('User after PII erasure:', {
      id: user.id,
      username: user.username,
      first_name: user.first_name, // จะเป็น 'DELETED'
      last_name: user.last_name,   // จะเป็น 'DELETED'
      email: user.email,           // จะเป็น null
      consent_withdrawn_date: user.consent_withdrawn_date
    });
  }

  /**
   * ตัวอย่าง: การทำ migration ข้อมูลเก่า
   */
  async demonstrateMigration() {
    console.log('🔄 Demonstrating data migration to encrypted format...');

    // ทดสอบ encryption service
    const encryptionTest = await UserEncryptionMigrationService.testEncryption();
    console.log(`Encryption service test: ${encryptionTest ? '✅ PASSED' : '❌ FAILED'}`);

    // ดูสถานะ migration
    const status = await UserEncryptionMigrationService.getMigrationStatus();
    console.log('Migration status:', status);

    // สร้าง PIPEDA compliance report
    const report = await UserEncryptionMigrationService.generatePipedaReport();
    console.log('PIPEDA Compliance Report:', {
      overall_score: report.compliance_summary.overall_score,
      encryption_complete: report.compliance_summary.encryption_complete,
      total_recommendations: report.recommendations.length,
      users_near_retention: report.users_near_retention.length
    });

    // ทดสอบการค้นหาด้วยข้อมูลที่เข้ารหัส
    await UserEncryptionMigrationService.testUserSearch();
  }

  /**
   * รันตัวอย่างทั้งหมด
   */
  async runAllExamples() {
    console.log('🚀 Starting PIPEDA Encryption System Demo...\n');

    try {
      // 1. ทดสอบ encryption service
      console.log('=== 1. Testing Encryption Service ===');
      await UserEncryptionMigrationService.testEncryption();

      // 2. สร้าง user ใหม่ที่เข้ารหัสแล้ว
      console.log('\n=== 2. Creating Encrypted User ===');
      await this.createEncryptedUser();

      // 3. ทดสอบการค้นหา
      console.log('\n=== 3. Searching Encrypted Users ===');
      await this.searchEncryptedUser();

      // 4. อัปเดตข้อมูล
      console.log('\n=== 4. Updating Encrypted User ===');
      await this.updateEncryptedUser();

      // 5. ส่งออกข้อมูล
      console.log('\n=== 5. Exporting User Data ===');
      await this.exportUserData();

      // 6. ทดสอบ migration
      console.log('\n=== 6. Migration Demo ===');
      await this.demonstrateMigration();

      // 7. PIPEDA compliance operations
      console.log('\n=== 7. PIPEDA Compliance Operations ===');
      await this.pipedaComplianceOperations();

      console.log('\n🎉 All examples completed successfully!');

    } catch (error) {
      console.error('❌ Error running examples:', error);
    }
  }
}

// ส่งออก instance สำหรับการใช้งาน
export default new PipedaUsageExample();

// สำหรับการรันโดยตรง
if (require.main === module) {
  const demo = new PipedaUsageExample();
  demo.runAllExamples().then(() => {
    console.log('Demo completed');
    process.exit(0);
  }).catch((error) => {
    console.error('Demo failed:', error);
    process.exit(1);
  });
}
