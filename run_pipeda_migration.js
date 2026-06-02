// Script to migrate existing user data to encrypted format
const userPipedaMigrationService = require('./dist/services/userPipedaMigrationService').default;

async function runMigration() {
  console.log('🔄 Starting PIPEDA data migration...\n');

  try {
    // 1. Check migration status first
    console.log('📊 Checking current migration status...');
    const status = await userPipedaMigrationService.getMigrationStatus();
    console.log('Current Status:', JSON.stringify(status, null, 2));

    if (status.totalUsers === 0) {
      console.log('⚠️  No users found in database');
      return;
    }

    if (status.encryptedUsers === status.totalUsers && status.encryptedUsers > 0) {
      console.log('✅ All users are already encrypted!');
      return;
    }

    // 2. Run batch migration
    console.log('\n🔐 Starting batch encryption migration...');
    const migrationResult = await userPipedaMigrationService.migrateToEncrypted(50); // Migrate 50 users at a time
    console.log('Migration Result:', JSON.stringify(migrationResult, null, 2));

    // 3. Check status after migration
    console.log('\n📊 Checking status after migration...');
    const finalStatus = await userPipedaMigrationService.getMigrationStatus();
    console.log('Final Status:', JSON.stringify(finalStatus, null, 2));

    // 4. Generate compliance report
    console.log('\n📋 Generating PIPEDA compliance report...');
    const report = await userPipedaMigrationService.generatePipedaReport();
    console.log('Compliance Report:', JSON.stringify(report, null, 2));

    console.log('\n🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    
    // Try to get detailed error info
    if (error.name === 'SequelizeConnectionError') {
      console.error('Database connection error. Please check your database configuration.');
    } else if (error.name === 'SequelizeDatabaseError') {
      console.error('Database error:', error.message);
      console.error('SQL:', error.sql);
    }
    
    process.exit(1);
  }
}

// Run the migration
if (require.main === module) {
  runMigration().then(() => {
    console.log('\n✅ Migration script finished');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runMigration };
