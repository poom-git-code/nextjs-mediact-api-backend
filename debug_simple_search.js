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

async function testFindUserByIdentifier() {
  try {
    console.log('🔍 Testing findUserByIdentifier logic...');
    
    const identifier = 'H014010001';
    
    // Test 1: Simple search without includes
    console.log('\n=== Test 1: Simple search (no includes) ===');
    const simpleUser = await User.findOne({
      where: {
        username: identifier,
        status_id: 1
      }
    });
    console.log('Simple search result:', simpleUser ? `ID: ${simpleUser.id}, username: ${simpleUser.username}` : 'Not found');
    
    // Test 2: Complex search with fake include (simulating the real query structure)
    console.log('\n=== Test 2: Search with complex where conditions ===');
    const complexUser = await User.findOne({
      where: {
        username: identifier,
        status_id: 1
      },
      attributes: ['id', 'username', 'status_id']
    });
    console.log('Complex search result:', complexUser ? `ID: ${complexUser.id}, username: ${complexUser.username}` : 'Not found');
    
    // Test 3: Test the exact structure used in findUserByIdentifier
    console.log('\n=== Test 3: Exact options structure simulation ===');
    const options = {
      where: { status_id: 1 }
    };
    
    const usernameWhere = {
      username: identifier,
      ...options.where,
    };
    console.log('Where clause:', JSON.stringify(usernameWhere, null, 2));
    
    const exactUser = await User.findOne({
      where: usernameWhere,
      attributes: ['id', 'username', 'status_id']
    });
    console.log('Exact search result:', exactUser ? `ID: ${exactUser.id}, username: ${exactUser.username}` : 'Not found');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

testFindUserByIdentifier();
