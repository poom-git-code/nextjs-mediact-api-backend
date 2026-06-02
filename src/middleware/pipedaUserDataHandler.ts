// PIPEDA User Data Middleware - Handle encrypted fields transparently
import PipedaEncryptionService from '../services/pipedaEncryptionService';
import UserModel from '../models/UserModel';

/**
 * Middleware to automatically decrypt user data when reading
 */
export class PipedaUserDataHandler {
  
  /**
   * Decrypt user data for API responses
   */
  static decryptUserData(user: any): any {
    if (!user) return user;
    
    // Convert Sequelize instance to plain object if needed
    const userData = user.toJSON ? user.toJSON() : user;
    
    // Decrypt username field if encrypted version exists and plain version is missing/empty
    if (userData.username_encrypted && (!userData.username || userData.username === '')) {
      userData.username = PipedaEncryptionService.decrypt(userData.username_encrypted);
    }
    
    // Decrypt fields if encrypted versions exist and plain versions are missing/empty
    if (userData.email_encrypted && (!userData.email || userData.email === '')) {
      userData.email = PipedaEncryptionService.decrypt(userData.email_encrypted);
    }
    
    if (userData.first_name_encrypted && (!userData.first_name || userData.first_name === '')) {
      userData.first_name = PipedaEncryptionService.decrypt(userData.first_name_encrypted);
    }
    
    if (userData.last_name_encrypted && (!userData.last_name || userData.last_name === '')) {
      userData.last_name = PipedaEncryptionService.decrypt(userData.last_name_encrypted);
    }
    
    if (userData.phone_number_encrypted && (!userData.phone_number || userData.phone_number === '')) {
      userData.phone_number = PipedaEncryptionService.decrypt(userData.phone_number_encrypted);
    }
    
    if (userData.date_of_birth_encrypted && (!userData.date_of_birth || userData.date_of_birth === '')) {
      userData.date_of_birth = PipedaEncryptionService.decryptDate(userData.date_of_birth_encrypted);
    }
    
    if (userData.id_card_number_encrypted && (!userData.id_card_number || userData.id_card_number === '')) {
      userData.id_card_number = PipedaEncryptionService.decrypt(userData.id_card_number_encrypted);
    }
    
    if (userData.passport_number_encrypted && (!userData.passport_number || userData.passport_number === '')) {
      userData.passport_number = PipedaEncryptionService.decrypt(userData.passport_number_encrypted);
    }
    
    if (userData.occupation_number_encrypted && (!userData.occupation_number || userData.occupation_number === '')) {
      userData.occupation_number = PipedaEncryptionService.decrypt(userData.occupation_number_encrypted);
    }
    
    if (userData.ID_line_encrypted && (!userData.ID_line || userData.ID_line === '')) {
      userData.ID_line = PipedaEncryptionService.decrypt(userData.ID_line_encrypted);
    }
    
    // Remove encrypted fields from response for security
    delete userData.email_encrypted;
    delete userData.first_name_encrypted;
    delete userData.last_name_encrypted;
    delete userData.phone_number_encrypted;
    delete userData.date_of_birth_encrypted;
    delete userData.id_card_number_encrypted;
    delete userData.passport_number_encrypted;
    delete userData.occupation_number_encrypted;
    delete userData.ID_line_encrypted;
    
    // Remove hash fields from response
    delete userData.email_hash;
    delete userData.phone_number_hash;
    delete userData.id_card_number_hash;
    
    return userData;
  }
  
  /**
   * Decrypt array of users
   */
  static decryptUsersData(users: any[]): any[] {
    if (!Array.isArray(users)) return users;
    return users.map(user => this.decryptUserData(user));
  }
  
  /**
   * Prepare data for encryption when creating/updating users
   */
  static prepareEncryptedData(inputData: any): any {
    const encryptedData = { ...inputData };
    
    // Encrypt username field and create hash but keep original username for database
    if (inputData.username) {
      encryptedData.username_encrypted = PipedaEncryptionService.encrypt(inputData.username);
      encryptedData.username_hash = PipedaEncryptionService.createSearchHash(inputData.username);
      // Keep original username since it's required by database schema
    }
    
    // Encrypt PII fields and clear plain text versions
    if (inputData.email) {
      encryptedData.email_encrypted = PipedaEncryptionService.encrypt(inputData.email);
      encryptedData.email_hash = PipedaEncryptionService.createSearchHash(inputData.email);
      // delete encryptedData.email; // Remove plain text
    }
    
    if (inputData.first_name) {
      encryptedData.first_name_encrypted = PipedaEncryptionService.encrypt(inputData.first_name);
      // delete encryptedData.first_name; // Remove plain text
    }
    
    if (inputData.last_name) {
      encryptedData.last_name_encrypted = PipedaEncryptionService.encrypt(inputData.last_name);
      // delete encryptedData.last_name; // Remove plain text
    }
    
    if (inputData.phone_number) {
      encryptedData.phone_number_encrypted = PipedaEncryptionService.encrypt(inputData.phone_number);
      encryptedData.phone_number_hash = PipedaEncryptionService.createSearchHash(inputData.phone_number);
      // delete encryptedData.phone_number; // Remove plain text
    }
    
    if (inputData.date_of_birth) {
      encryptedData.date_of_birth_encrypted = PipedaEncryptionService.encryptDate(inputData.date_of_birth);
      // delete encryptedData.date_of_birth; // Remove plain text
    }
    
    if (inputData.id_card_number) {
      encryptedData.id_card_number_encrypted = PipedaEncryptionService.encrypt(inputData.id_card_number);
      encryptedData.id_card_number_hash = PipedaEncryptionService.createSearchHash(inputData.id_card_number);
      // delete encryptedData.id_card_number; // Remove plain text
    }
    
    if (inputData.passport_number) {
      encryptedData.passport_number_encrypted = PipedaEncryptionService.encrypt(inputData.passport_number);
      // delete encryptedData.passport_number; // Remove plain text
    }
    
    if (inputData.occupation_number) {
      encryptedData.occupation_number_encrypted = PipedaEncryptionService.encrypt(inputData.occupation_number);
      // delete encryptedData.occupation_number; // Remove plain text
    }
    
    if ('ID_line' in inputData) {
      if (inputData.ID_line === null) {
        encryptedData.ID_line_encrypted = null;
        encryptedData.ID_line = null;
      } else if (inputData.ID_line) {
        encryptedData.ID_line_encrypted = PipedaEncryptionService.encrypt(inputData.ID_line);
        // delete encryptedData.ID_line; // Remove plain text
      }
    }
    
    // Set encryption metadata
    if (inputData.username || inputData.email || inputData.first_name || inputData.last_name || inputData.phone_number || 
        inputData.date_of_birth || inputData.id_card_number || inputData.passport_number || 
        inputData.occupation_number || inputData.ID_line) {
      encryptedData.is_encrypted = true;
      encryptedData.encryption_version = 'v1.0';
      encryptedData.encryption_migrated_at = new Date();
    }
    
    return encryptedData;
  }
  
  /**
   * Search users by encrypted fields
   */
  static async searchByEncryptedField(fieldName: string, value: string): Promise<UserModel[]> {
    const hash = PipedaEncryptionService.createSearchHash(value);
    
    switch (fieldName) {
      case 'username':
        return await UserModel.findAll({ where: { username_hash: hash } });
      case 'email':
        return await UserModel.findAll({ where: { email_hash: hash } });
      case 'phone_number':
        return await UserModel.findAll({ where: { phone_number_hash: hash } });
      case 'id_card_number':
        return await UserModel.findAll({ where: { id_card_number_hash: hash } });
      default:
        throw new Error(`Search not supported for field: ${fieldName}`);
    }
  }
}

export default PipedaUserDataHandler;
