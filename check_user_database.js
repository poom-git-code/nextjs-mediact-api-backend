// ตรวจสอบข้อมูล user ในฐานข้อมูลโดยตรง
require('dotenv').config();
const { Sequelize, Op } = require('sequelize');

// สร้าง connection ไปยังฐานข้อมูล
const sequelize = new Sequelize(
  process.env.DB_NAME || 'mediact_db',
  process.env.DB_USERNAME || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false // ปิด SQL logging
  }
);

const checkUserInDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    const identifier = 'H0110001';
    console.log(`\n🔍 Searching for user with identifier: ${identifier}`);
    console.log('='.repeat(50));
    
    // ค้นหาด้วย username
    console.log('\n1. ค้นหาด้วย username:');
    const [usernameResults] = await sequelize.query(`
      SELECT id, username, email, email_encrypted, email_hash, password, status_id, created_at
      FROM users 
      WHERE username = :identifier
    `, {
      replacements: { identifier },
      type: Sequelize.QueryTypes.SELECT
    });
    
    if (usernameResults) {
      console.log('✅ Found user by username:', {
        id: usernameResults.id,
        username: usernameResults.username,
        email: usernameResults.email ? 'Has plain email' : 'No plain email',
        email_encrypted: usernameResults.email_encrypted ? 'Has encrypted email' : 'No encrypted email',
        email_hash: usernameResults.email_hash ? 'Has email hash' : 'No email hash',
        password: usernameResults.password ? 'Has password hash' : 'No password',
        status_id: usernameResults.status_id,
        created_at: usernameResults.created_at
      });
    } else {
      console.log('❌ No user found with username:', identifier);
    }
    
    // ค้นหาผู้ใช้ทั้งหมดที่มี username ใกล้เคียง
    console.log('\n2. ค้นหา username ที่ใกล้เคียง:');
    const [similarUsers] = await sequelize.query(`
      SELECT id, username, email, status_id
      FROM users 
      WHERE username LIKE :pattern
      LIMIT 10
    `, {
      replacements: { pattern: `%${identifier.substring(0, 6)}%` },
      type: Sequelize.QueryTypes.SELECT
    });
    
    if (similarUsers && similarUsers.length > 0) {
      console.log(`✅ Found ${similarUsers.length} similar usernames:`);
      similarUsers.forEach(user => {
        console.log(`  - ID: ${user.id}, Username: ${user.username}, Status: ${user.status_id}`);
      });
    } else {
      console.log('❌ No similar usernames found');
    }
    
    // ตรวจสอบว่ามี user ที่ status_id = 1 หรือไม่
    console.log('\n3. ตรวจสอบ active users:');
    const [activeUsersCount] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM users 
      WHERE status_id = 1
    `, {
      type: Sequelize.QueryTypes.SELECT
    });
    
    console.log(`✅ Total active users (status_id = 1): ${activeUsersCount.count}`);
    
    // ตรวจสอบ user status ทั้งหมด
    console.log('\n4. ตรวจสอบ user status types:');
    const statusCounts = await sequelize.query(`
      SELECT status_id, COUNT(*) as count
      FROM users 
      GROUP BY status_id
      ORDER BY status_id
    `, {
      type: Sequelize.QueryTypes.SELECT
    });
    
    console.log('User status distribution:');
    statusCounts.forEach(status => {
      console.log(`  - Status ID ${status.status_id}: ${status.count} users`);
    });
    
    // ตรวจสอบ password hashing
    if (usernameResults && usernameResults.password) {
      console.log('\n5. ตรวจสอบ password format:');
      console.log(`Password hash length: ${usernameResults.password.length}`);
      console.log(`Password starts with: ${usernameResults.password.substring(0, 10)}...`);
      
      // ทดสอบ bcrypt compare
      const bcrypt = require('bcrypt');
      const testPassword = '11111111';
      
      try {
        const isValidPassword = await bcrypt.compare(testPassword, usernameResults.password);
        console.log(`Password '${testPassword}' matches: ${isValidPassword ? '✅ YES' : '❌ NO'}`);
      } catch (error) {
        console.log('❌ Error comparing password:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await sequelize.close();
    console.log('\n🔚 Database connection closed');
  }
};

// เรียกใช้ function
checkUserInDatabase().catch(console.error);
