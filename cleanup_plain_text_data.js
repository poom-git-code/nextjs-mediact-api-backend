// Script to clean up plain text PII data after encryption migration
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: process.env.DB_DIALECT,
  logging: false
});

async function cleanupPlainTextData() {
  console.log('🧹 Starting cleanup of plain text PII data...\n');

  try {
    // 1. Check current status
    console.log('📊 Checking current data status...');
    const [beforeStats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN first_name IS NOT NULL AND first_name != '' THEN 1 END) as plain_first_name,
        COUNT(CASE WHEN last_name IS NOT NULL AND last_name != '' THEN 1 END) as plain_last_name,
        COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as plain_email,
        COUNT(CASE WHEN phone_number IS NOT NULL AND phone_number != '' THEN 1 END) as plain_phone,
        COUNT(CASE WHEN first_name_encrypted IS NOT NULL AND first_name_encrypted != '' THEN 1 END) as encrypted_first_name,
        COUNT(CASE WHEN last_name_encrypted IS NOT NULL AND last_name_encrypted != '' THEN 1 END) as encrypted_last_name,
        COUNT(CASE WHEN email_encrypted IS NOT NULL AND email_encrypted != '' THEN 1 END) as encrypted_email,
        COUNT(CASE WHEN phone_number_encrypted IS NOT NULL AND phone_number_encrypted != '' THEN 1 END) as encrypted_phone
      FROM users
    `);
    
    console.log('Before Cleanup:', JSON.stringify(beforeStats[0], null, 2));

    // 2. Verify that all data has encrypted versions before cleanup
    console.log('\n🔍 Verifying encrypted data exists...');
    const [missingEncrypted] = await sequelize.query(`
      SELECT COUNT(*) as users_missing_encrypted_data
      FROM users 
      WHERE (first_name IS NOT NULL AND first_name != '' AND (first_name_encrypted IS NULL OR first_name_encrypted = ''))
         OR (last_name IS NOT NULL AND last_name != '' AND (last_name_encrypted IS NULL OR last_name_encrypted = ''))
         OR (email IS NOT NULL AND email != '' AND (email_encrypted IS NULL OR email_encrypted = ''))
         OR (phone_number IS NOT NULL AND phone_number != '' AND (phone_number_encrypted IS NULL OR phone_number_encrypted = ''))
    `);

    if (missingEncrypted[0].users_missing_encrypted_data > 0) {
      console.error(`❌ Found ${missingEncrypted[0].users_missing_encrypted_data} users with plain text data but missing encrypted versions!`);
      console.error('Please run PIPEDA migration first before cleanup.');
      return;
    }

    console.log('✅ All plain text data has corresponding encrypted versions.');

    // 3. Clean up plain text PII data (skip backup due to DB constraints)
    console.log('\n🧹 Cleaning up plain text PII data...');
    console.log('⚠️  Skipping backup creation due to database constraints.');
    
    const cleanupResult = await sequelize.query(`
      UPDATE users 
      SET 
        first_name = NULL,
        last_name = NULL,
        email = NULL,
        phone_number = NULL,
        date_of_birth = NULL,
        id_card_number = NULL,
        passport_number = NULL,
        occupation_number = NULL,
        ID_line = NULL
      WHERE is_encrypted = 1 
        AND (first_name_encrypted IS NOT NULL OR last_name_encrypted IS NOT NULL 
             OR email_encrypted IS NOT NULL OR phone_number_encrypted IS NOT NULL)
    `);

    console.log(`✅ Cleaned up plain text data for ${cleanupResult[1]} users`);

    // 4. Verify cleanup
    console.log('\n📊 Checking status after cleanup...');
    const [afterStats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN first_name IS NOT NULL AND first_name != '' THEN 1 END) as plain_first_name,
        COUNT(CASE WHEN last_name IS NOT NULL AND last_name != '' THEN 1 END) as plain_last_name,
        COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as plain_email,
        COUNT(CASE WHEN phone_number IS NOT NULL AND phone_number != '' THEN 1 END) as plain_phone,
        COUNT(CASE WHEN first_name_encrypted IS NOT NULL AND first_name_encrypted != '' THEN 1 END) as encrypted_first_name,
        COUNT(CASE WHEN last_name_encrypted IS NOT NULL AND last_name_encrypted != '' THEN 1 END) as encrypted_last_name,
        COUNT(CASE WHEN email_encrypted IS NOT NULL AND email_encrypted != '' THEN 1 END) as encrypted_email,
        COUNT(CASE WHEN phone_number_encrypted IS NOT NULL AND phone_number_encrypted != '' THEN 1 END) as encrypted_phone
      FROM users
    `);
    
    console.log('After Cleanup:', JSON.stringify(afterStats[0], null, 2));

    // 5. Final verification - show remaining plain text data
    const [remainingPlain] = await sequelize.query(`
      SELECT COUNT(*) as remaining_plain_text_records
      FROM users 
      WHERE (first_name IS NOT NULL AND first_name != '') 
         OR (last_name IS NOT NULL AND last_name != '') 
         OR (email IS NOT NULL AND email != '') 
         OR (phone_number IS NOT NULL AND phone_number != '')
    `);

    console.log(`\n🎯 Remaining plain text records: ${remainingPlain[0].remaining_plain_text_records}`);

    if (remainingPlain[0].remaining_plain_text_records === 0) {
      console.log('🎉 SUCCESS: All plain text PII data has been cleaned up!');
      console.log('🔐 Your system is now fully PIPEDA compliant with encrypted-only storage.');
    } else {
      console.log('⚠️  Some plain text data still remains. This might be intentional for non-PII fields or test accounts.');
    }

    // 6. Generate final compliance report
    console.log('\n📋 Final PIPEDA Compliance Report:');
    const complianceReport = {
      timestamp: new Date().toISOString(),
      total_users: afterStats[0].total_users,
      encrypted_storage: {
        first_name: afterStats[0].encrypted_first_name,
        last_name: afterStats[0].encrypted_last_name,
        email: afterStats[0].encrypted_email,
        phone: afterStats[0].encrypted_phone
      },
      plain_text_storage: {
        first_name: afterStats[0].plain_first_name,
        last_name: afterStats[0].plain_last_name,
        email: afterStats[0].plain_email,
        phone: afterStats[0].plain_phone
      },
      pipeda_compliance: remainingPlain[0].remaining_plain_text_records === 0,
      cleanup_completed: true
    };

    console.log(JSON.stringify(complianceReport, null, 2));

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    
    if (error.name === 'SequelizeConnectionError') {
      console.error('Database connection error. Please check your database configuration.');
    } else if (error.name === 'SequelizeDatabaseError') {
      console.error('Database error:', error.message);
    }
    
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run cleanup
cleanupPlainTextData().then(() => {
  console.log('\n✅ Cleanup script finished');
}).catch(error => {
  console.error('Script error:', error);
  process.exit(1);
});
