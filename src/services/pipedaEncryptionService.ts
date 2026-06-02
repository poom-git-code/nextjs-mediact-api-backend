import * as crypto from 'crypto';

class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;
  
  private masterKey: Buffer;

  constructor() {
    const key = process.env.ENCRYPTION_MASTER_KEY || '';
    this.masterKey = crypto.scryptSync(key, 'pipeda-salt', this.keyLength);
  }

  /**
   * เข้ารหัสข้อมูล (AES-256-GCM)
   */
  encrypt(plaintext: string | null): string | null {
    if (!plaintext) return null;
    
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipheriv(this.algorithm, this.masterKey, iv);
      
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      // รวม IV + Tag + Encrypted Data
      return iv.toString('hex') + tag.toString('hex') + encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      return plaintext; // fallback เพื่อป้องกันข้อมูลหาย
    }
  }

  /**
   * ถอดรหัสข้อมูล
   */
  decrypt(encryptedData: string | null): string | null {
    if (!encryptedData) return null;
    
    try {
      // แยก IV, Tag และ Encrypted Data
      const iv = Buffer.from(encryptedData.slice(0, this.ivLength * 2), 'hex');
      const tag = Buffer.from(encryptedData.slice(this.ivLength * 2, (this.ivLength + this.tagLength) * 2), 'hex');
      const encrypted = encryptedData.slice((this.ivLength + this.tagLength) * 2);
      
      const decipher = crypto.createDecipheriv(this.algorithm, this.masterKey, iv);
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      // ถ้า decrypt ไม่ได้ แสดงว่าเป็นข้อมูลเก่าที่ยังไม่ได้เข้ารหัส
      console.warn('Decryption failed, returning original data for backward compatibility');
      return encryptedData;
    }
  }

  /**
   * ตรวจสอบว่าข้อมูลถูกเข้ารหัสแล้วหรือยัง
   */
  isEncrypted(data: string | null): boolean {
    if (!data) return false;
    
    // ข้อมูลที่เข้ารหัสแล้วจะมีความยาวขั้นต่ำ (IV + Tag + Data)
    const minEncryptedLength = (this.ivLength + this.tagLength) * 2 + 2;
    if (data.length < minEncryptedLength) return false;
    
    try {
      // ลองดึง IV และ Tag ออกมา
      const iv = data.slice(0, this.ivLength * 2);
      const tag = data.slice(this.ivLength * 2, (this.ivLength + this.tagLength) * 2);
      
      // ตรวจสอบว่าเป็น hex string หรือไม่
      return /^[0-9a-fA-F]+$/.test(iv) && /^[0-9a-fA-F]+$/.test(tag);
    } catch {
      return false;
    }
  }

  /**
   * สร้าง hash สำหรับการค้นหา (ไม่สามารถ reverse ได้)
   */
  createSearchHash(data: string | null): string | null {
    if (!data) return null;
    
    const salt = process.env.SEARCH_SALT || '';
    return crypto.createHash('sha256').update(data.toLowerCase() + salt).digest('hex');
  }

  /**
   * เข้ารหัสข้อมูลวันที่
   */
  encryptDate(date: Date | string | null): string | null {
    if (!date) return null;
    
    try {
      // Convert to Date object if it's a string
      let dateObj: Date;
      if (typeof date === 'string') {
        dateObj = new Date(date);
        // Check if the date is valid
        if (isNaN(dateObj.getTime())) {
          console.warn(`Invalid date string: ${date}`);
          return null;
        }
      } else {
        dateObj = date;
      }
      
      return this.encrypt(dateObj.toISOString());
    } catch (error) {
      console.error('Error encrypting date:', error);
      return null;
    }
  }

  /**
   * ถอดรหัสข้อมูลวันที่
   */
  decryptDate(encryptedData: string | null): Date | null {
    if (!encryptedData) return null;
    const decrypted = this.decrypt(encryptedData);
    
    try {
      return decrypted ? new Date(decrypted) : null;
    } catch {
      try {
        return new Date(encryptedData);
      } catch {
        return null;
      }
    }
  }

  /**
   * สร้าง masked version ของข้อมูลสำหรับ logging
   */
  createMaskedVersion(data: string | null, visibleChars: number = 2): string | null {
    if (!data) return null;
    if (data.length <= visibleChars * 2) return '*'.repeat(data.length);
    
    const start = data.substring(0, visibleChars);
    const end = data.substring(data.length - visibleChars);
    const middle = '*'.repeat(data.length - (visibleChars * 2));
    
    return start + middle + end;
  }
}

export default new EncryptionService();
