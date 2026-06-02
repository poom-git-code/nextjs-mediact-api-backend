import { Context } from 'koa';
import UserModel from '../models/UserModel';
import UserEncryptionMigrationService from '../services/userEncryptionMigrationService';

/**
 * ตัวอย่าง Controller สำหรับจัดการ User ด้วย PIPEDA Encryption
 */

/**
 * สร้าง user ใหม่ด้วยข้อมูลที่เข้ารหัส
 */
export const createUserWithEncryption = async (ctx: Context) => {
  try {
    const {
      username,
      password,
      email,
      first_name,
      last_name,
      phone_number,
      date_of_birth,
      id_card_number,
      passport_number,
      occupation_number,
      ID_line,
      gender_id = 1,
      status_id = 1
    } = ctx.request.body as any;

    // สร้าง user ใหม่
    const newUser = await UserModel.create({
      username,
      password, // ควรจะ hash แล้ว
      first_name: first_name || 'Unknown',
      last_name: last_name || 'User',
      gender_id,
      status_id
    });

    // เข้ารหัสข้อมูล PII
    if (email) newUser.setEncryptedEmail(email);
    if (first_name) newUser.setEncryptedFirstName(first_name);
    if (last_name) newUser.setEncryptedLastName(last_name);
    if (phone_number) newUser.setEncryptedPhoneNumber(phone_number);
    if (date_of_birth) newUser.setEncryptedDateOfBirth(new Date(date_of_birth));
    if (id_card_number) newUser.setEncryptedIdCardNumber(id_card_number);
    if (passport_number) newUser.setEncryptedPassportNumber(passport_number);
    if (occupation_number) newUser.setEncryptedOccupationNumber(occupation_number);
    if (ID_line) newUser.setEncryptedIDLine(ID_line);

    // ตั้งค่า PIPEDA compliance
    newUser.is_encrypted = true;
    newUser.encryption_version = 'v1.0';
    newUser.encryption_migrated_at = new Date();
    
    // บันทึกความยินยอม
    await newUser.recordConsent();
    
    // ตั้งค่าระยะเวลาเก็บข้อมูล (7 ปี)
    await newUser.markForDataRetention(84);

    await newUser.save();

    // ส่งกลับข้อมูลที่ถอดรหัสแล้ว
    ctx.status = 201;
    ctx.body = {
      success: true,
      message: 'User created successfully with PIPEDA encryption',
      data: newUser.toPipedaCompliantJSON()
    };

  } catch (error: any) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: 'Failed to create user',
      error: error.message
    };
  }
};

/**
 * ดึงข้อมูล user ด้วย ID (ถอดรหัสอัตโนมัติ)
 */
export const getUserByIdEncrypted = async (ctx: Context) => {
  try {
    const userId = parseInt(ctx.params.id);
    
    const user = await UserModel.findByPk(userId, {
      include: [
        { association: 'user_status' },
        { association: 'user_gender' },
        { association: 'user_roles' }
      ]
    });

    if (!user) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: 'User not found'
      };
      return;
    }

    // ส่งกลับข้อมูลที่ถอดรหัสแล้ว
    ctx.body = {
      success: true,
      data: user.toPipedaCompliantJSON()
    };

  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: 'Failed to get user',
      error: error.message
    };
  }
};

/**
 * ค้นหา user ด้วย email (ใช้ search hash)
 */
export const findUserByEmail = async (ctx: Context) => {
  try {
    const { email } = ctx.query;

    if (!email) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: 'Email parameter is required'
      };
      return;
    }

    const user = await UserModel.findByEmailSafe(email as string);

    if (!user) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: 'User not found'
      };
      return;
    }

    ctx.body = {
      success: true,
      data: user.toPipedaCompliantJSON()
    };

  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: 'Failed to find user by email',
      error: error.message
    };
  }
};

/**
 * อัปเดตข้อมูล user ด้วยการเข้ารหัส
 */
export const updateUserWithEncryption = async (ctx: Context) => {
  try {
    const userId = parseInt(ctx.params.id);
    const updateData = ctx.request.body as any;

    const user = await UserModel.findByPk(userId);

    if (!user) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: 'User not found'
      };
      return;
    }

    // อัปเดตข้อมูลที่ไม่ sensitive
    if (updateData.username) user.username = updateData.username;
    if (updateData.nickname) user.nickname = updateData.nickname;
    if (updateData.gender_id) user.gender_id = updateData.gender_id;
    if (updateData.status_id) user.status_id = updateData.status_id;

    // อัปเดตข้อมูล PII ด้วยการเข้ารหัส
    if (updateData.email) user.setEncryptedEmail(updateData.email);
    if (updateData.first_name) user.setEncryptedFirstName(updateData.first_name);
    if (updateData.last_name) user.setEncryptedLastName(updateData.last_name);
    if (updateData.phone_number) user.setEncryptedPhoneNumber(updateData.phone_number);
    if (updateData.date_of_birth) user.setEncryptedDateOfBirth(new Date(updateData.date_of_birth));
    if (updateData.id_card_number) user.setEncryptedIdCardNumber(updateData.id_card_number);
    if (updateData.passport_number) user.setEncryptedPassportNumber(updateData.passport_number);
    if (updateData.occupation_number) user.setEncryptedOccupationNumber(updateData.occupation_number);
    if (updateData.ID_line) user.setEncryptedIDLine(updateData.ID_line);

    // ตั้งค่าว่าถูกเข้ารหัสแล้ว (ถ้ายังไม่ได้เข้ารหัส)
    if (!user.is_encrypted) {
      user.is_encrypted = true;
      user.encryption_version = 'v1.0';
      user.encryption_migrated_at = new Date();
    }

    await user.save();

    ctx.body = {
      success: true,
      message: 'User updated successfully',
      data: user.toPipedaCompliantJSON()
    };

  } catch (error: any) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: 'Failed to update user',
      error: error.message
    };
  }
};

/**
 * ดูสถานะ PIPEDA compliance
 */
export const getPipedaComplianceStatus = async (ctx: Context) => {
  try {
    const status = await UserEncryptionMigrationService.getMigrationStatus();
    const report = await UserEncryptionMigrationService.generatePipedaReport();

    ctx.body = {
      success: true,
      data: {
        migration_status: status,
        compliance_report: report
      }
    };

  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: 'Failed to get PIPEDA compliance status',
      error: error.message
    };
  }
};

/**
 * Migrate user ไปเป็น encrypted format
 */
export const migrateUserToEncrypted = async (ctx: Context) => {
  try {
    const userId = parseInt(ctx.params.id);

    const user = await UserEncryptionMigrationService.migrateUserById(userId);

    ctx.body = {
      success: true,
      message: 'User migrated to encrypted format successfully',
      data: user.toPipedaCompliantJSON()
    };

  } catch (error: any) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: 'Failed to migrate user',
      error: error.message
    };
  }
};

/**
 * ลบข้อมูล PII ของ user (Right to be forgotten)
 */
export const erasePiiData = async (ctx: Context) => {
  try {
    const userId = parseInt(ctx.params.id);

    const user = await UserModel.findByPk(userId);

    if (!user) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: 'User not found'
      };
      return;
    }

    // บันทึกการถอนความยินยอม
    await user.recordConsentWithdrawal();
    
    // ลบข้อมูล PII
    await user.erasePiiData();

    ctx.body = {
      success: true,
      message: 'User PII data erased successfully per PIPEDA right to be forgotten',
      data: {
        user_id: userId,
        consent_withdrawn_date: user.consent_withdrawn_date,
        status: 'PII_ERASED'
      }
    };

  } catch (error: any) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: 'Failed to erase PII data',
      error: error.message
    };
  }
};

/**
 * ทดสอบระบบ encryption
 */
export const testEncryptionSystem = async (ctx: Context) => {
  try {
    // ทดสอบ encryption service
    const encryptionTest = await UserEncryptionMigrationService.testEncryption();
    
    // ทดสอบการค้นหา
    const searchTest = await UserEncryptionMigrationService.testUserSearch();

    ctx.body = {
      success: true,
      message: 'Encryption system test completed',
      data: {
        encryption_test: encryptionTest ? 'PASSED' : 'FAILED',
        search_test: searchTest ? 'PASSED' : 'FAILED',
        timestamp: new Date()
      }
    };

  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: 'Encryption system test failed',
      error: error.message
    };
  }
};

/**
 * ส่งออกข้อมูล user แบบ masked (สำหรับ admin/debugging)
 */
export const getUserMaskedData = async (ctx: Context) => {
  try {
    const userId = parseInt(ctx.params.id);
    
    const user = await UserModel.findByPk(userId);

    if (!user) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: 'User not found'
      };
      return;
    }

    ctx.body = {
      success: true,
      message: 'User data (masked for privacy)',
      data: user.toMaskedJSON()
    };

  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: 'Failed to get masked user data',
      error: error.message
    };
  }
};
