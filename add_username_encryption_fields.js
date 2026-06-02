const { sequelize } = require('./dist/config/database');

async function addUsernameEncryptionFields() {
  try {
    console.log('🚀 Adding username encryption fields to users table...\n');
    
    // เชื่อมต่อกับฐานข้อมูล
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // เพิ่ม username_encrypted field
    console.log('\n📝 Adding username_encrypted field...');
    try {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN username_encrypted TEXT NULL 
        COMMENT 'AES-256-GCM encrypted username (PIPEDA compliance)' 
        AFTER username
      `);
      console.log('✅ username_encrypted field added successfully');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('⚠️ username_encrypted field already exists');
      } else {
        throw error;
      }
    }
    
    // เพิ่ม username_hash field
    console.log('\n📝 Adding username_hash field...');
    try {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN username_hash VARCHAR(64) NULL 
        COMMENT 'SHA-256 hash for encrypted username search' 
        AFTER email_hash
      `);
      console.log('✅ username_hash field added successfully');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('⚠️ username_hash field already exists');
      } else {
        throw error;
      }
    }
    
    // เพิ่ม index สำหรับ username_hash เพื่อเพิ่มประสิทธิภาพการค้นหา
    console.log('\n📝 Adding index for username_hash...');
    try {
      await sequelize.query(`
        CREATE INDEX idx_users_username_hash ON users (username_hash)
      `);
      console.log('✅ Index for username_hash created successfully');
    } catch (error) {
      if (error.message.includes('Duplicate key name')) {
        console.log('⚠️ Index for username_hash already exists');
      } else {
        throw error;
      }
    }
    
    // ตรวจสอบโครงสร้างตาราง
    console.log('\n📝 Verifying table structure...');
    const [results] = await sequelize.query(`
      DESCRIBE users
    `);
    
    const usernameEncryptedField = results.find(field => field.Field === 'username_encrypted');
    const usernameHashField = results.find(field => field.Field === 'username_hash');
    
    if (usernameEncryptedField) {
      console.log('✅ username_encrypted field verified:', usernameEncryptedField.Type);
    } else {
      console.log('❌ username_encrypted field not found');
    }
    
    if (usernameHashField) {
      console.log('✅ username_hash field verified:', usernameHashField.Type);
    } else {
      console.log('❌ username_hash field not found');
    }
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Summary of changes:');
    console.log('✅ Added username_encrypted TEXT field');
    console.log('✅ Added username_hash VARCHAR(64) field');
    console.log('✅ Added index on username_hash for search performance');
    
    console.log('\n🔧 Next Steps:');
    console.log('1. Run encryption migration to encrypt existing usernames');
    console.log('2. Test login functionality with encrypted data');
    console.log('3. Update application to handle encrypted username searches');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

// รันการ migration
addUsernameEncryptionFields();
