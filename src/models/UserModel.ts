import { Association, DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import UserRoleModel from "./UserRolesModel";
import UserEmploymentModel from "./UserEmploymentsModel";
import RoleModel from "./RolesModel";
import GenderModel from "./GenderModel";
import UserStatusModel from "./UserStatusModel";
import EncryptionService from "../services/encryptionService";
import UserContentInteractionModel from "./UserContentInteractionModel";
import UserContentViewModel from "./UserContentView";

import UserExperienceModel from "./UserExperienceModel";
import UserCertificationModel from "./UserCertificationModel";

export class UserModel extends Model {
  public id!: number;
  public username!: string;
  public password!: string;
  public need_password_reset!: boolean;
  public email!: string | null;
  public is_verified_email!: boolean;
  public verified_email_date!: Date | null;
  public first_name!: string | null;
  public last_name!: string | null;
  public nickname!: string | null;
  public country_code!: string | null;
  public phone_number!: string | null;
  public is_verified_phone!: boolean;
  public verified_phone_date!: Date | null;
  public date_of_birth!: Date | null;
  public gender_id!: number;
  public profile_picture!: string | null;
  public id_card_number!: string | null;
  public id_card_url!: string | null;
  public passport_number!: string | null;
  public passport_url!: string | null;
  public two_factor_enabled!: boolean;
  public failed_login_attempts!: number;
  public last_password_change!: Date | null;
  public reset_password_token!: string | null;
  public reset_password_ref!: string | null;
  public reset_password_expires!: Date | null;
  public status_id!: number;
  public status_reason!: string | null;
  public referral_code!: string | null;
  public preferences!: object | null;
  public last_login!: Date | null;

  public occupation_document_url!: string | null;
  public occupation_number!: string | null;
  public occupation_passed_unit!: string | null;
  public occupation_expired!: Date | null;
  public ID_line!: string | null;

  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
  public occupation_experienced!: string | null;

  public verification_token!: string | null;
  public verification_ref!: string | null;
  public verification_expires!: Date | null;

  // PIPEDA Compliance - Encrypted PII fields
  public email_encrypted?: string | null;
  public first_name_encrypted?: string | null;
  public last_name_encrypted?: string | null;
  public phone_number_encrypted?: string | null;
  public date_of_birth_encrypted?: string | null;
  public id_card_number_encrypted?: string | null;
  public passport_number_encrypted?: string | null;
  public occupation_number_encrypted?: string | null;
  public ID_line_encrypted?: string | null;

  // Search hash fields for encrypted data
  public email_hash?: string | null;
  public phone_number_hash?: string | null;
  public id_card_number_hash?: string | null;

  // Encryption metadata
  public is_encrypted?: boolean;
  public encryption_version?: string;
  public encryption_migrated_at?: Date | null;

  // PIPEDA compliance tracking
  public data_retention_date?: Date | null;
  public consent_given_date?: Date | null;
  public consent_withdrawn_date?: Date | null;
  public privacy_policy_version?: string;

  public user_role?: UserRoleModel;
  public user_employment?: UserEmploymentModel;
  public user_status?: UserStatusModel;
  public user_gender?: GenderModel;

  public user_experiences?: UserExperienceModel[];
  public user_certifications?: UserCertificationModel[];

  public static associations: {
    user_role: Association<UserModel, UserRoleModel>;
    user_employment: Association<UserModel, UserEmploymentModel>;
    user_status: Association<UserModel, UserStatusModel>;
    user_gender: Association<UserModel, GenderModel>;
  };

  /**
   * PIPEDA Compliant Methods - ถอดรหัสข้อมูลที่ละเอียดอ่อน
   */
  getDecryptedEmail(): string | null {
    if (this.email_encrypted) {
      return EncryptionService.decrypt(this.email_encrypted);
    }
    return this.email; // fallback สำหรับข้อมูลเก่า
  }

  getDecryptedFirstName(): string | null {
    if (this.first_name_encrypted) {
      return EncryptionService.decrypt(this.first_name_encrypted);
    }
    return this.first_name;
  }

  getDecryptedLastName(): string | null {
    if (this.last_name_encrypted) {
      return EncryptionService.decrypt(this.last_name_encrypted);
    }
    return this.last_name;
  }

  getDecryptedPhoneNumber(): string | null {
    if (this.phone_number_encrypted) {
      return EncryptionService.decrypt(this.phone_number_encrypted);
    }
    return this.phone_number;
  }

  getDecryptedDateOfBirth(): Date | null {
    if (this.date_of_birth_encrypted) {
      return EncryptionService.decryptDate(this.date_of_birth_encrypted);
    }
    return this.date_of_birth;
  }

  getDecryptedIdCardNumber(): string | null {
    if (this.id_card_number_encrypted) {
      return EncryptionService.decrypt(this.id_card_number_encrypted);
    }
    return this.id_card_number;
  }

  getDecryptedPassportNumber(): string | null {
    if (this.passport_number_encrypted) {
      return EncryptionService.decrypt(this.passport_number_encrypted);
    }
    return this.passport_number;
  }

  getDecryptedOccupationNumber(): string | null {
    if (this.occupation_number_encrypted) {
      return EncryptionService.decrypt(this.occupation_number_encrypted);
    }
    return this.occupation_number;
  }

  getDecryptedIDLine(): string | null {
    if (this.ID_line_encrypted) {
      return EncryptionService.decrypt(this.ID_line_encrypted);
    }
    return this.ID_line;
  }

  /**
   * ตั้งค่าข้อมูลแบบ encrypted (สำหรับ update/create)
   */
  setEncryptedEmail(email: string | null) {
    this.email_encrypted = EncryptionService.encrypt(email);
    this.email_hash = EncryptionService.createSearchHash(email);
    this.email = email; // เก็บข้อมูลเดิมไว้ด้วยในระหว่าง transition
  }

  setEncryptedPhoneNumber(phoneNumber: string | null) {
    this.phone_number_encrypted = EncryptionService.encrypt(phoneNumber);
    this.phone_number_hash = EncryptionService.createSearchHash(phoneNumber);
    this.phone_number = phoneNumber;
  }

  setEncryptedIdCardNumber(idCardNumber: string | null) {
    this.id_card_number_encrypted = EncryptionService.encrypt(idCardNumber);
    this.id_card_number_hash = EncryptionService.createSearchHash(idCardNumber);
    this.id_card_number = idCardNumber;
  }

  setEncryptedFirstName(firstName: string | null) {
    this.first_name_encrypted = EncryptionService.encrypt(firstName);
    // No longer set plain text field for encrypted-only storage
  }

  setEncryptedLastName(lastName: string | null) {
    this.last_name_encrypted = EncryptionService.encrypt(lastName);
    // No longer set plain text field for encrypted-only storage
  }

  setEncryptedDateOfBirth(dateOfBirth: Date | null) {
    this.date_of_birth_encrypted = EncryptionService.encryptDate(dateOfBirth);
    this.date_of_birth = dateOfBirth;
  }

  setEncryptedPassportNumber(passportNumber: string | null) {
    this.passport_number_encrypted = EncryptionService.encrypt(passportNumber);
    this.passport_number = passportNumber;
  }

  setEncryptedOccupationNumber(occupationNumber: string | null) {
    this.occupation_number_encrypted =
      EncryptionService.encrypt(occupationNumber);
    this.occupation_number = occupationNumber;
  }

  setEncryptedIDLine(idLine: string | null) {
    this.ID_line_encrypted = EncryptionService.encrypt(idLine);
    this.ID_line = idLine;
  }

  /**
   * ส่งออกข้อมูลที่ถอดรหัสแล้วสำหรับ API (PIPEDA compliant)
   */
  toPipedaCompliantJSON() {
    const json = this.toJSON();
    return {
      ...json,
      // ใช้ข้อมูลที่ถอดรหัสแล้ว
      email: this.getDecryptedEmail(),
      first_name: this.getDecryptedFirstName(),
      last_name: this.getDecryptedLastName(),
      phone_number: this.getDecryptedPhoneNumber(),
      date_of_birth: this.getDecryptedDateOfBirth(),
      id_card_number: this.getDecryptedIdCardNumber(),
      passport_number: this.getDecryptedPassportNumber(),
      occupation_number: this.getDecryptedOccupationNumber(),
      ID_line: this.getDecryptedIDLine(),

      // ซ่อนข้อมูลที่เข้ารหัสออกจาก response
      email_encrypted: undefined,
      first_name_encrypted: undefined,
      last_name_encrypted: undefined,
      phone_number_encrypted: undefined,
      date_of_birth_encrypted: undefined,
      id_card_number_encrypted: undefined,
      passport_number_encrypted: undefined,
      occupation_number_encrypted: undefined,
      ID_line_encrypted: undefined,
      email_hash: undefined,
      phone_number_hash: undefined,
      id_card_number_hash: undefined,
    };
  }

  /**
   * ส่งออกข้อมูลแบบ masked สำหรับ logging
   */
  toMaskedJSON() {
    const json = this.toJSON();
    return {
      ...json,
      email: EncryptionService.createMaskedVersion(this.getDecryptedEmail(), 2),
      first_name: EncryptionService.createMaskedVersion(
        this.getDecryptedFirstName(),
        1
      ),
      last_name: EncryptionService.createMaskedVersion(
        this.getDecryptedLastName(),
        1
      ),
      phone_number: EncryptionService.createMaskedVersion(
        this.getDecryptedPhoneNumber(),
        3
      ),
      id_card_number: EncryptionService.createMaskedVersion(
        this.getDecryptedIdCardNumber(),
        2
      ),
      passport_number: EncryptionService.createMaskedVersion(
        this.getDecryptedPassportNumber(),
        2
      ),
      occupation_number: EncryptionService.createMaskedVersion(
        this.getDecryptedOccupationNumber(),
        2
      ),
    };
  }

  /**
   * Static methods สำหรับการค้นหาแบบ PIPEDA compliant
   */
  static async findByEmailSafe(email: string) {
    const emailHash = EncryptionService.createSearchHash(email);

    // ลองหาจาก hash ก่อน (ข้อมูลที่เข้ารหัสแล้ว)
    let user = await this.findOne({
      where: { email_hash: emailHash },
    });

    // ถ้าไม่เจอ ลองหาจาก email เดิม (ข้อมูลเก่าที่ยังไม่ได้เข้ารหัส)
    if (!user) {
      user = await this.findOne({
        where: { email: email },
      });
    }

    return user;
  }

  static async findByPhoneNumberSafe(phoneNumber: string) {
    const phoneHash = EncryptionService.createSearchHash(phoneNumber);

    let user = await this.findOne({
      where: { phone_number_hash: phoneHash },
    });

    if (!user) {
      user = await this.findOne({
        where: { phone_number: phoneNumber },
      });
    }

    return user;
  }

  static async findByIdCardNumberSafe(idCardNumber: string) {
    const idCardHash = EncryptionService.createSearchHash(idCardNumber);

    let user = await this.findOne({
      where: { id_card_number_hash: idCardHash },
    });

    if (!user) {
      user = await this.findOne({
        where: { id_card_number: idCardNumber },
      });
    }

    return user;
  }

  /**
   * PIPEDA compliance methods
   */
  async markForDataRetention(retentionMonths: number = 84) {
    // 7 years default per PIPEDA
    const retentionDate = new Date();
    retentionDate.setMonth(retentionDate.getMonth() + retentionMonths);

    await this.update({
      data_retention_date: retentionDate,
    });
  }

  async recordConsent() {
    await this.update({
      consent_given_date: new Date(),
      consent_withdrawn_date: null,
    });
  }

  async recordConsentWithdrawal() {
    await this.update({
      consent_withdrawn_date: new Date(),
    });
  }

  /**
   * ลบข้อมูลส่วนบุคคลตาม PIPEDA (Right to be forgotten)
   */
  async erasePiiData() {
    await this.update({
      email: null,
      email_encrypted: null,
      email_hash: null,
      first_name: "DELETED",
      first_name_encrypted: null,
      last_name: "DELETED",
      last_name_encrypted: null,
      phone_number: null,
      phone_number_encrypted: null,
      phone_number_hash: null,
      id_card_number: null,
      id_card_number_encrypted: null,
      id_card_number_hash: null,
      passport_number: null,
      passport_number_encrypted: null,
      occupation_number: null,
      occupation_number_encrypted: null,
      ID_line: null,
      ID_line_encrypted: null,
      date_of_birth: null,
      date_of_birth_encrypted: null,
      consent_withdrawn_date: new Date(),
    });
  }
}

UserModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary Key: Unique ID for each user",
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: "Unique username for the user",
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Hashed password for the user",
    },
    need_password_reset: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Indicates if user needs to reset password on next login",
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Email address of the user",
    },
    is_verified_email: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Indicates if email is verified",
    },
    verified_email_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Date when email was verified",
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment:
        "Deprecated: Use first_name_encrypted field for PIPEDA compliance",
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment:
        "Deprecated: Use last_name_encrypted field for PIPEDA compliance",
    },
    nickname: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Nickname of the user",
    },
    country_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: "Country code for the phone number (e.g., +66)",
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "Phone number of the user",
    },
    is_verified_phone: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Indicates if phone is verified",
    },
    verified_phone_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Date when phone was verified",
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Date of birth of the user",
    },
    gender_id: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Gender ID reference",
    },
    profile_picture: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      comment: "URL to the profile picture of the user",
    },
    id_card_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "ID card number of the user",
    },
    id_card_url: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      comment: "URL to uploaded ID card of the user",
    },
    passport_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Passport number of the user",
    },
    passport_url: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      comment: "URL to uploaded passport of the user",
    },
    two_factor_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Indicates if two-factor authentication is enabled",
    },
    failed_login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Number of failed login attempts",
    },
    last_password_change: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Timestamp of the last password change",
    },
    reset_password_token: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "Token for resetting password",
    },
    reset_password_ref: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "Reference for password reset",
    },
    reset_password_expires: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Expiry timestamp for reset password token",
    },
    status_id: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "User status ID reference",
    },
    status_reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Reason for the current account status",
    },
    referral_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Referral code used during signup",
    },
    preferences: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "User-specific preferences in JSON format",
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Last login timestamp for the user",
    },

    occupation_document_url: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      comment: "URL to occupation document",
    },
    occupation_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Occupation license number",
    },
    occupation_passed_unit: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Comma-separated string of units user has passed",
    },
    occupation_expired: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Occupation license expiration date",
    },
    ID_line: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "LINE ID of user",
    },

    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "User ID of the creator who created this record",
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "User ID of the last updater who updated this record",
    },

    verification_token: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "Token for email/phone verification",
    },
    verification_ref: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "Reference for email/phone verification",
    },
    verification_expires: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Expiry timestamp for verification token",
    },

    // PIPEDA Compliance - Encrypted PII fields
    email_encrypted: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "AES-256-GCM encrypted email address (PIPEDA compliance)",
    },
    first_name_encrypted: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "AES-256-GCM encrypted first name (PIPEDA compliance)",
    },
    last_name_encrypted: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "AES-256-GCM encrypted last name (PIPEDA compliance)",
    },
    phone_number_encrypted: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "AES-256-GCM encrypted phone number (PIPEDA compliance)",
    },
    date_of_birth_encrypted: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "AES-256-GCM encrypted date of birth (PIPEDA compliance)",
    },
    id_card_number_encrypted: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "AES-256-GCM encrypted ID card number (PIPEDA compliance)",
    },
    passport_number_encrypted: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "AES-256-GCM encrypted passport number (PIPEDA compliance)",
    },
    occupation_number_encrypted: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "AES-256-GCM encrypted occupation number (PIPEDA compliance)",
    },
    ID_line_encrypted: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "AES-256-GCM encrypted LINE ID (PIPEDA compliance)",
    },

    // Search hash fields for encrypted data lookup
    email_hash: {
      type: DataTypes.STRING(64),
      allowNull: true,
      comment: "SHA-256 hash for encrypted email search",
    },
    phone_number_hash: {
      type: DataTypes.STRING(64),
      allowNull: true,
      comment: "SHA-256 hash for encrypted phone number search",
    },
    id_card_number_hash: {
      type: DataTypes.STRING(64),
      allowNull: true,
      comment: "SHA-256 hash for encrypted ID card number search",
    },

    // Encryption metadata
    is_encrypted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Flag indicating if user PII data is encrypted",
    },
    encryption_version: {
      type: DataTypes.STRING(10),
      defaultValue: "v1.0",
      comment: "Version of encryption algorithm used",
    },
    encryption_migrated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Timestamp when user data was encrypted",
    },

    // PIPEDA compliance tracking
    data_retention_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment:
        "Date when user data should be deleted per PIPEDA (7 years default)",
    },
    consent_given_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Date when user gave consent for personal data processing",
    },
    consent_withdrawn_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Date when user withdrew consent for data processing",
    },
    privacy_policy_version: {
      type: DataTypes.STRING(10),
      defaultValue: "v1.0",
      comment: "Version of privacy policy user agreed to",
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment:
      "User accounts table with PIPEDA compliance encryption for Canadian privacy laws",
  }
);

// UserModel.hasMany(UserRoleModel, {
//   as: "user_role",
//   foreignKey: "user_id",
//   sourceKey: "id",
// });
UserModel.hasMany(UserRoleModel, {
  as: "user_roles",
  foreignKey: "user_id",
  sourceKey: "id",
});
UserModel.hasMany(UserEmploymentModel, {
  as: "user_employment",
  foreignKey: "user_id",
  sourceKey: "id",
});
// UserRoleModel.belongsTo(RoleModel, {
//   as: "role",
//   foreignKey: "role_id",
//   targetKey: "id",
// });
UserModel.belongsTo(GenderModel, {
  as: "user_gender",
  foreignKey: "gender_id",
  targetKey: "id",
});

UserModel.belongsTo(UserStatusModel, {
  as: "user_status",
  foreignKey: "status_id",
  targetKey: "id",
});

UserModel.hasMany(UserContentInteractionModel, {
  as: "interactions",
  foreignKey: "user_id",
});

UserModel.hasMany(UserContentViewModel, {
  as: "views",
  foreignKey: "user_id",
});

export default UserModel;
