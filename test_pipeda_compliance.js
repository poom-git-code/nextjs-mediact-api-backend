#!/usr/bin/env node

/**
 * PIPEDA Compliance Test Script
 * ทดสอบระบบ encryption/decryption สำหรับ PIPEDA compliance
 */

const pipedaEncryptionService = require('./dist/services/pipedaEncryptionService').default;
const userPipedaMigrationService = require('./dist/services/userPipedaMigrationService').default;

async function main() {
  console.log('🧪 PIPEDA Compliance Test Suite\n');

  try {
    // Test 1: Encryption Service
    console.log('=== Test 1: Encryption Service ===');
    await userPipedaMigrationService.testEncryption();

    // Test 2: Migration Status
    console.log('\n=== Test 2: Migration Status ===');
    const status = await userPipedaMigrationService.getMigrationStatus();
    console.log('Migration Status:', JSON.stringify(status, null, 2));

    // Test 3: Search Hash Testing
    console.log('\n=== Test 3: Search Hash Testing ===');
    const testEmail = 'test@example.com';
    const hash1 = pipedaEncryptionService.createSearchHash(testEmail);
    const hash2 = pipedaEncryptionService.createSearchHash(testEmail);
    const hash3 = pipedaEncryptionService.createSearchHash('different@example.com');
    
    console.log(`Email: ${testEmail}`);
    console.log(`Hash 1: ${hash1}`);
    console.log(`Hash 2: ${hash2}`);
    console.log(`Hash 3: ${hash3}`);
    console.log(`Same email = same hash: ${hash1 === hash2 ? '✅' : '❌'}`);
    console.log(`Different email = different hash: ${hash1 !== hash3 ? '✅' : '❌'}`);

    // Test 4: Data Masking
    console.log('\n=== Test 4: Data Masking ===');
    const sensitiveData = [
      'john.doe@example.com',
      '+66812345678',
      '1234567890123',
      'John Doe'
    ];

    sensitiveData.forEach(data => {
      const masked = pipedaEncryptionService.createMaskedVersion(data, 2);
      console.log(`${data} → ${masked}`);
    });

    // Test 5: Compliance Report
    console.log('\n=== Test 5: PIPEDA Compliance Report ===');
    const report = await userPipedaMigrationService.generatePipedaReport();
    console.log('Compliance Report:', JSON.stringify(report, null, 2));

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// เรียกใช้งานเมื่อไฟล์ถูกรันโดยตรง
if (require.main === module) {
  main().then(() => {
    console.log('\n✅ PIPEDA test suite finished');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { main };
