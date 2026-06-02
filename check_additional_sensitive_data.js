// Check additional sensitive data that needs encryption
const UserModel = require('./dist/models/UserModel').default;
const { Op } = require('sequelize');

async function checkAdditionalSensitiveData() {
  console.log('🔍 Checking Additional Sensitive Data for PIPEDA Compliance\n');

  try {
    // Check sample of users for additional sensitive fields
    const users = await UserModel.findAll({
      attributes: [
        'id',
        // Plain text fields that might contain sensitive data
        'id_card_number', 'passport_number', 'occupation_number', 'ID_line', 'date_of_birth',
        // Encrypted versions
        'id_card_number_encrypted', 'passport_number_encrypted', 'occupation_number_encrypted', 
        'ID_line_encrypted', 'date_of_birth_encrypted',
        // Metadata
        'is_encrypted'
      ],
      limit: 5,
      raw: true
    });

    console.log('📊 Sample Users Analysis:');
    users.forEach(user => {
      console.log(`\n👤 User ID ${user.id}:`);
      
      // Check id_card_number
      const hasIdCard = user.id_card_number ? true : false;
      const hasIdCardEncrypted = user.id_card_number_encrypted ? true : false;
      console.log(`  • ID Card: Plain=${hasIdCard ? '⚠️ YES' : '✅ NULL'}, Encrypted=${hasIdCardEncrypted ? '✅ YES' : '❌ NO'}`);
      
      // Check passport_number
      const hasPassport = user.passport_number ? true : false;
      const hasPassportEncrypted = user.passport_number_encrypted ? true : false;
      console.log(`  • Passport: Plain=${hasPassport ? '⚠️ YES' : '✅ NULL'}, Encrypted=${hasPassportEncrypted ? '✅ YES' : '❌ NO'}`);
      
      // Check occupation_number
      const hasOccupation = user.occupation_number ? true : false;
      const hasOccupationEncrypted = user.occupation_number_encrypted ? true : false;
      console.log(`  • Occupation: Plain=${hasOccupation ? '⚠️ YES' : '✅ NULL'}, Encrypted=${hasOccupationEncrypted ? '✅ YES' : '❌ NO'}`);
      
      // Check ID_line
      const hasIdLine = user.ID_line ? true : false;
      const hasIdLineEncrypted = user.ID_line_encrypted ? true : false;
      console.log(`  • LINE ID: Plain=${hasIdLine ? '⚠️ YES' : '✅ NULL'}, Encrypted=${hasIdLineEncrypted ? '✅ YES' : '❌ NO'}`);
      
      // Check date_of_birth
      const hasDob = user.date_of_birth ? true : false;
      const hasDobEncrypted = user.date_of_birth_encrypted ? true : false;
      console.log(`  • Date of Birth: Plain=${hasDob ? '⚠️ YES' : '✅ NULL'}, Encrypted=${hasDobEncrypted ? '✅ YES' : '❌ NO'}`);
    });

    // Summary analysis
    console.log('\n📈 Summary Analysis:');
    
    const totalUsers = await UserModel.count();
    
    const usersWithPlainIdCard = await UserModel.count({
      where: { id_card_number: { [Op.ne]: null } }
    });
    
    const usersWithPlainPassport = await UserModel.count({
      where: { passport_number: { [Op.ne]: null } }
    });
    
    const usersWithPlainOccupation = await UserModel.count({
      where: { occupation_number: { [Op.ne]: null } }
    });
    
    const usersWithPlainIdLine = await UserModel.count({
      where: { ID_line: { [Op.ne]: null } }
    });
    
    const usersWithPlainDob = await UserModel.count({
      where: { date_of_birth: { [Op.ne]: null } }
    });

    console.log(`Total users: ${totalUsers}`);
    console.log(`Users with plain text ID cards: ${usersWithPlainIdCard} ${usersWithPlainIdCard > 0 ? '⚠️' : '✅'}`);
    console.log(`Users with plain text passports: ${usersWithPlainPassport} ${usersWithPlainPassport > 0 ? '⚠️' : '✅'}`);
    console.log(`Users with plain text occupation numbers: ${usersWithPlainOccupation} ${usersWithPlainOccupation > 0 ? '⚠️' : '✅'}`);
    console.log(`Users with plain text LINE IDs: ${usersWithPlainIdLine} ${usersWithPlainIdLine > 0 ? '⚠️' : '✅'}`);
    console.log(`Users with plain text dates of birth: ${usersWithPlainDob} ${usersWithPlainDob > 0 ? '⚠️' : '✅'}`);

    const totalPlainTextFields = usersWithPlainIdCard + usersWithPlainPassport + usersWithPlainOccupation + usersWithPlainIdLine + usersWithPlainDob;
    
    console.log('\n🎯 PIPEDA Compliance Status:');
    if (totalPlainTextFields === 0) {
      console.log('✅ All additional sensitive data is properly encrypted!');
      console.log('✅ 100% PIPEDA compliance for additional fields');
    } else {
      console.log(`❌ Found ${totalPlainTextFields} instances of plain text sensitive data`);
      console.log('⚠️ Additional encryption needed for full PIPEDA compliance');
      
      console.log('\n📝 Recommended Actions:');
      if (usersWithPlainIdCard > 0) console.log('• Encrypt id_card_number fields');
      if (usersWithPlainPassport > 0) console.log('• Encrypt passport_number fields');
      if (usersWithPlainOccupation > 0) console.log('• Encrypt occupation_number fields');
      if (usersWithPlainIdLine > 0) console.log('• Encrypt ID_line fields');
      if (usersWithPlainDob > 0) console.log('• Encrypt date_of_birth fields');
    }

  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

// Run the analysis
if (require.main === module) {
  checkAdditionalSensitiveData().then(() => {
    console.log('\n🏁 Additional sensitive data analysis completed');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Analysis failed:', error);
    process.exit(1);
  });
}

module.exports = { checkAdditionalSensitiveData };
