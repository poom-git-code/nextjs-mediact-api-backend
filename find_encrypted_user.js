const { sequelize } = require('./dist/config/database');
const UserModel = require('./dist/models/UserModel').default;
const { Op } = require('sequelize');

async function findUserWithData() {
  try {
    const user = await UserModel.findOne({
      where: { 
        first_name_encrypted: { [Op.ne]: null } 
      },
      attributes: ['id', 'username', 'first_name', 'first_name_encrypted', 'last_name', 'last_name_encrypted', 'email', 'email_encrypted']
    });
    
    if (user) {
      console.log('Found user with encrypted data:');
      console.log('ID:', user.id);
      console.log('Username:', user.username);
      console.log('Has encrypted first_name:', !!user.first_name_encrypted);
      console.log('Has encrypted last_name:', !!user.last_name_encrypted);
      console.log('Has encrypted email:', !!user.email_encrypted);
    } else {
      console.log('No users found with encrypted data');
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
    await sequelize.close();
  }
}

findUserWithData();
