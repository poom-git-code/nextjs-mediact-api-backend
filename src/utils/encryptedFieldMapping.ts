// Encrypted Field Mapping Helper for PIPEDA Compliance
// This helper provides consistent field mapping for encrypted user data across all services

import { PipedaUserDataHandler } from "../middleware/pipedaUserDataHandler";

/**
 * Helper function to get encrypted user attributes (real field names for proper PIPEDA decryption)
 * Returns actual encrypted field names AND plain field names so PipedaUserDataHandler can decrypt them properly
 */
export const getUserAttributes = () =>
  [
    "id",
    "username",
    "first_name_encrypted",
    "first_name", // Include plain field for decryption fallback
    "last_name_encrypted",
    "last_name", // Include plain field for decryption fallback
    "email_encrypted",
    "email", // Include plain field for decryption fallback
    "phone_number_encrypted",
    "phone_number", // Include plain field for decryption fallback
    "profile_picture",
    "created_by",
    "updated_by",
    "created_at",
    "updated_at",
  ] as any;

/**
 * Decrypt user data and remove encrypted fields - ตอบโจทย์ของ front-end ที่ต้องการแค่ field ปกติ
 * @param userData - ข้อมูล user ที่มี encrypted fields
 * @returns ข้อมูล user ที่ decrypt แล้วและไม่มี encrypted fields
 */
export const decryptAndCleanUserData = (userData: any): any => {
  if (!userData) return userData;

  // Decrypt ข้อมูลก่อน
  const decryptedData = PipedaUserDataHandler.decryptUserData(userData);

  // Decrypt nested relations ถ้ามี
  if (decryptedData.created_by_user) {
    decryptedData.created_by_user = PipedaUserDataHandler.decryptUserData(
      decryptedData.created_by_user
    );
  }

  if (decryptedData.updated_by_user) {
    decryptedData.updated_by_user = PipedaUserDataHandler.decryptUserData(
      decryptedData.updated_by_user
    );
  }

  // ลบ encrypted fields ออกเพื่อให้ front-end ได้แค่ field ปกติ
  const cleanData = { ...decryptedData };
  delete cleanData.first_name_encrypted;
  delete cleanData.last_name_encrypted;
  delete cleanData.email_encrypted;
  delete cleanData.phone_number_encrypted;
  delete cleanData.date_of_birth_encrypted;
  delete cleanData.id_card_number_encrypted;
  delete cleanData.passport_number_encrypted;
  delete cleanData.occupation_number_encrypted;
  delete cleanData.ID_line_encrypted;

  // ลบ encrypted fields จาก nested relations ด้วย
  if (cleanData.created_by_user) {
    delete cleanData.created_by_user.first_name_encrypted;
    delete cleanData.created_by_user.last_name_encrypted;
    delete cleanData.created_by_user.email_encrypted;
    delete cleanData.created_by_user.phone_number_encrypted;
    delete cleanData.created_by_user.ID_line_encrypted;
  }

  if (cleanData.updated_by_user) {
    delete cleanData.updated_by_user.first_name_encrypted;
    delete cleanData.updated_by_user.last_name_encrypted;
    delete cleanData.updated_by_user.email_encrypted;
    delete cleanData.updated_by_user.phone_number_encrypted;
    delete cleanData.updated_by_user.ID_line_encrypted;
  }

  return cleanData;
};

/**
 * Decrypt array of users data and remove encrypted fields
 * @param users - array ของ user data ที่มี encrypted fields
 * @returns array ของ user data ที่ decrypt แล้วและไม่มี encrypted fields
 */
export const decryptAndCleanUsersData = (users: any[]): any[] => {
  if (!users || !Array.isArray(users)) return users;

  return users.map((user) => decryptAndCleanUserData(user));
};

/**
 * Helper function to get basic encrypted user attributes (real field names for proper PIPEDA decryption)
 * Returns actual encrypted field names AND plain field names so PipedaUserDataHandler can decrypt them properly
 */
export const getBasicUserAttributes = () =>
  [
    "id",
    "username",
    "first_name_encrypted",
    "first_name", // Include plain field for decryption fallback
    "last_name_encrypted",
    "last_name", // Include plain field for decryption fallback
    "email_encrypted",
    "email", // Include plain field for decryption fallback
    "phone_number_encrypted",
    "phone_number", // Include plain field for decryption fallback
    "profile_picture",
    "ID_line_encrypted",
    "ID_line", // Include plain field for decryption fallback
    "created_by",
    "updated_by",
    "created_at",
    "updated_at",
  ] as any;

/**
 * Helper function to create email hash for searching encrypted email data
 * Uses the same hashing method as PIPEDA middleware
 */
export const createEmailHash = (email: string): string => {
  const crypto = require("crypto");
  const salt = process.env.SEARCH_SALT || "default_search_salt";
  return crypto
    .createHash("sha256")
    .update(email + salt)
    .digest("hex");
};

/**
 * Helper function to create phone number hash for searching encrypted phone data
 * Uses the same hashing method as PIPEDA middleware
 */
export const createPhoneHash = (phoneNumber: string): string => {
  const crypto = require("crypto");
  const salt = process.env.SEARCH_SALT || "default_search_salt";
  return crypto
    .createHash("sha256")
    .update(phoneNumber + salt)
    .digest("hex");
};

/**
 * Helper function to find user by email using encrypted fields
 * Searches using email hash instead of plain text email
 */
export const findUserByEmail = async (
  email: string,
  UserModel: any,
  options: any = {}
) => {
  const emailHash = createEmailHash(email);

  return await UserModel.findOne({
    where: {
      email_hash: emailHash,
      ...options.where,
    },
    ...options,
  });
};

/**
 * Helper function to find user by phone number using encrypted fields
 * Searches using phone number hash instead of plain text phone number
 */
export const findUserByPhoneNumber = async (
  phoneNumber: string,
  UserModel: any,
  options: any = {}
) => {
  const phoneHash = createPhoneHash(phoneNumber);

  return await UserModel.findOne({
    where: {
      phone_number_hash: phoneHash,
      ...options.where,
    },
    ...options,
  });
};

/**
 * Helper function to find user by username using plain text username field
 * Searches using plain username field (not encrypted)
 */
export const findUserByUsername = async (
  username: string,
  UserModel: any,
  options: any = {}
) => {
  return await UserModel.findOne({
    where: {
      username: username,
      ...options.where,
    },
    ...options,
  });
};

/**
 * Helper function to find user by identifier (username or email)
 * First tries username (plain text), then tries email (encrypted)
 */
export const findUserByIdentifier = async (
  identifier: string,
  UserModel: any,
  options: any = {}
) => {
  console.log("🔍 findUserByIdentifier called with identifier:", identifier);
  console.log("📋 Options:", JSON.stringify(options, null, 2));
  
  // สร้าง where clause สำหรับ username search
  const usernameWhere = {
    username: identifier,
    ...options.where,
  };
  console.log("🔎 Username search WHERE clause:", JSON.stringify(usernameWhere, null, 2));
  
  // Step 1: ค้นหา user โดยไม่มี includes ก่อน
  console.log("🔍 Step 1: Simple search for user ID");
  const simpleUser = await UserModel.findOne({
    where: usernameWhere,
    attributes: ['id'],
    logging: (sql: string) => console.log("🗃️ Simple Username Search SQL:", sql)
  });
  
  if (simpleUser) {
    console.log("✅ Found user ID:", simpleUser.id);
    
    // Step 2: ถ้าเจอ user แล้ว ให้ query ใหม่พร้อม includes โดยใช้ id เป็นหลัก
    console.log("🔍 Step 2: Full query with includes");
    const fullQueryOptions = {
      ...options,
      where: { 
        id: simpleUser.id,
        ...options.where
      }
    };
    console.log("🔎 Full query WHERE clause:", JSON.stringify(fullQueryOptions.where, null, 2));
    
    const fullUser = await UserModel.findOne({
      ...fullQueryOptions,
      logging: (sql: string) => console.log("🗃️ Full Query SQL:", sql)
    });
    
    console.log("findUserByIdentifier: Found user with username:", identifier);
    console.log("User by username:", fullUser ? `Found ID: ${fullUser.id}, username: ${fullUser.username}` : "Not found in full query");
    return fullUser;
  }

  console.log("options: ", options);
  console.log("findUserByIdentifier: Searching for user with username: ", identifier);
  console.log("User by username: Not found");

  // ถ้าไม่พบ ให้ตรวจสอบ email (encrypted)
  console.log("🔍 Step 3: Search by email if username not found");
  const emailHash = createEmailHash(identifier);
  console.log("🔑 Generated email hash:", emailHash.substring(0, 16) + "...");
  
  const emailWhere = {
    email_hash: emailHash,
    ...options.where,
  };
  console.log("📧 Email search WHERE clause:", JSON.stringify(emailWhere, null, 2));
  
  // Step 1: ค้นหา user โดย email hash โดยไม่มี includes ก่อน
  const simpleEmailUser = await UserModel.findOne({
    where: emailWhere,
    attributes: ['id'],
    logging: (sql: string) => console.log("🗃️ Simple Email Search SQL:", sql)
  });
  
  if (simpleEmailUser) {
    console.log("✅ Found user by email, ID:", simpleEmailUser.id);
    
    // Step 2: ถ้าเจอ user แล้ว ให้ query ใหม่พร้อม includes โดยใช้ id เป็นหลัก
    const fullEmailQueryOptions = {
      ...options,
      where: { 
        id: simpleEmailUser.id,
        ...options.where
      }
    };
    console.log("🔎 Full email query WHERE clause:", JSON.stringify(fullEmailQueryOptions.where, null, 2));
    
    const fullEmailUser = await UserModel.findOne({
      ...fullEmailQueryOptions,
      logging: (sql: string) => console.log("🗃️ Full Email Query SQL:", sql)
    });
    
    console.log("findUserByIdentifier: Found user with email:", identifier);
    console.log("User by email:", fullEmailUser ? `Found ID: ${fullEmailUser.id}, email: ${fullEmailUser.email}` : "Not found in full query");
    
    console.log("🎯 Final findUserByIdentifier result:", fullEmailUser ? `User ID: ${fullEmailUser.id}` : "No user found");
    return fullEmailUser;
  }
  
  console.log("findUserByIdentifier: Searching for user with email: ", identifier);
  console.log("User by email: Not found");
  console.log("🎯 Final findUserByIdentifier result: No user found");
  return null;
};

/**
 * Helper function to get user attributes including username for authentication/identification purposes
 * Returns actual encrypted field names AND plain field names so PipedaUserDataHandler can decrypt them properly
 */
export const getUserWithUsernameAttributes = () =>
  [
    "id",
    "username",
    "first_name_encrypted",
    "first_name", // Include plain field for decryption fallback
    "last_name_encrypted",
    "last_name", // Include plain field for decryption fallback
    "email_encrypted",
    "email", // Include plain field for decryption fallback
    "profile_picture",
    "created_by",
    "updated_by",
    "created_at",
    "updated_at",
  ] as any;
