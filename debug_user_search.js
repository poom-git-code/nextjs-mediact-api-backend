const { Sequelize, DataTypes } = require('sequelize');

// สร้าง connection ไปที่ database
const sequelize = new Sequelize('mediact', 'mediact.app', 'AVNS_x_NN1gum9YWMatxt-CE', {
  host: 'db-mysql-sgp1-14392-do-user-18527211-0.e.db.ondigitalocean.com',
  port: 25060,
  dialect: 'mysql',
  logging: console.log // แสดง SQL queries
});

// สร้าง User model อย่างง่าย
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: false
});

async function debugUserSearch() {
  try {
    console.log('🔍 Testing user search...');
    
    // Test 1: ค้นหา user ID 1
    console.log('\n=== Test 1: Find user ID 1 ===');
    const user1 = await User.findOne({
      where: { id: 1 }
    });
    console.log('User ID 1:', user1 ? `ID: ${user1.id}, username: ${user1.username}, status_id: ${user1.status_id}` : 'Not found');
    
    // Test 2: ค้นหาด้วย username 'H014010001'
    console.log('\n=== Test 2: Find user with username H014010001 ===');
    const userByUsername = await User.findOne({
      where: { username: 'H014010001' }
    });
    console.log('User by username H014010001:', userByUsername ? `ID: ${userByUsername.id}, username: ${userByUsername.username}, status_id: ${userByUsername.status_id}` : 'Not found');
    
    // Test 3: ค้นหาด้วย username 'H014010001' และ status_id = 1
    console.log('\n=== Test 3: Find user with username H014010001 AND status_id = 1 ===');
    const userWithStatus = await User.findOne({
      where: { 
        username: 'H014010001',
        status_id: 1
      }
    });
    console.log('User with username H014010001 AND status_id = 1:', userWithStatus ? `ID: ${userWithStatus.id}, username: ${userWithStatus.username}, status_id: ${userWithStatus.status_id}` : 'Not found');
    
    // Test 4: ดูทุก user ที่มี status_id = 1
    console.log('\n=== Test 4: All users with status_id = 1 ===');
    const allActiveUsers = await User.findAll({
      where: { status_id: 1 },
      attributes: ['id', 'username', 'status_id']
    });
    console.log('All users with status_id = 1:');
    allActiveUsers.forEach(user => {
      console.log(`  - ID: ${user.id}, username: ${user.username}, status_id: ${user.status_id}`);
    });
    
    // Test 5: ดูทุก user ที่มี username like H014010001
    console.log('\n=== Test 5: Users with username containing H014010001 ===');
    const usersLike = await User.findAll({
      where: { 
        username: {
          [Sequelize.Op.like]: '%H014010001%'
        }
      },
      attributes: ['id', 'username', 'status_id']
    });
    console.log('Users with username containing H014010001:');
    usersLike.forEach(user => {
      console.log(`  - ID: ${user.id}, username: ${user.username}, status_id: ${user.status_id}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

debugUserSearch();
