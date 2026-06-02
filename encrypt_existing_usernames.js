const { sequelize } = require('./dist/config/database');
const UserModel = require('./dist/models/UserModel').default;
const PipedaEncryptionService = require('./dist/services/pipedaEncryptionService').default;

async function encryptExistingUsernames() {
  try {
    console.log('🔐 Encrypting existing usernames in the database...\n');
    
    // เชื่อมต่อกับฐานข้อมูล
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // ดึงผู้ใช้ทั้งหมดที่ยังไม่ได้เข้ารหัส username
    console.log('\n📝 Finding users with unencrypted usernames...');
    const users = await UserModel.findAll({
      where: {
        username_encrypted: null, // ยังไม่ได้เข้ารหัส
        username: {
          [require('sequelize').Op.ne]: null // username ไม่เป็น null
        }
      },
      attributes: ['id', 'username', 'username_encrypted', 'username_hash']
    });
    
    console.log(`Found ${users.length} users with unencrypted usernames`);
    
    if (users.length === 0) {
      console.log('✅ All usernames are already encrypted or no users found');
      return;
    }
    
    // เข้ารหัส username ทีละคน
    console.log('\n🔄 Encrypting usernames...');
    let successCount = 0;
    let errorCount = 0;
    
    for (const user of users) {
      try {
        const username = user.username;
        const encryptedUsername = PipedaEncryptionService.encrypt(username);
        const usernameHash = PipedaEncryptionService.createSearchHash(username);
        
        // อัปเดตข้อมูลในฐานข้อมูล
        await sequelize.query(`
          UPDATE users 
          SET username_encrypted = :encryptedUsername,
              username_hash = :usernameHash,
              is_encrypted = 1,
              encryption_version = 'v1.0',
              encryption_migrated_at = NOW()
          WHERE id = :userId
        `, {
          replacements: {
            encryptedUsername,
            usernameHash,
            userId: user.id
          }
        });
        
        successCount++;
        console.log(`✅ User ${user.id} (${username}): encrypted successfully`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ User ${user.id}: encryption failed -`, error.message);
      }
    }
    
    console.log('\n📊 Encryption Results:');
    console.log(`✅ Successfully encrypted: ${successCount} usernames`);
    console.log(`❌ Failed to encrypt: ${errorCount} usernames`);
    console.log(`📊 Total processed: ${successCount + errorCount} usernames`);
    
    // ตรวจสอบผลลัพธ์
    console.log('\n🔍 Verifying encrypted data...');
    const encryptedUsers = await UserModel.findAll({
      where: {
        username_encrypted: {
          [require('sequelize').Op.ne]: null
        }
      },
      attributes: ['id', 'username', 'username_encrypted', 'username_hash'],
      limit: 3
    });
    
    console.log('\nSample encrypted users:');
    for (const user of encryptedUsers) {
      try {
        const decryptedUsername = PipedaEncryptionService.decrypt(user.username_encrypted);
        console.log(`User ${user.id}:`);
        console.log(`  Original: ${user.username}`);
        console.log(`  Encrypted: ${user.username_encrypted.substring(0, 50)}...`);
        console.log(`  Hash: ${user.username_hash}`);
        console.log(`  Decrypted: ${decryptedUsername}`);
        console.log(`  Match: ${user.username === decryptedUsername ? '✅' : '❌'}`);
        console.log('');
      } catch (error) {
        console.log(`  Decryption failed: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Username encryption completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Existing usernames encrypted with AES-256-GCM');
    console.log('✅ Search hashes created for encrypted usernames');
    console.log('✅ Encryption metadata updated');
    console.log('✅ Login system now supports encrypted username searches');
    
  } catch (error) {
    console.error('❌ Username encryption failed:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

// รันการเข้ารหัส
encryptExistingUsernames();
