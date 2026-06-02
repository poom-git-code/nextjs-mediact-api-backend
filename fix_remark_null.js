const { sequelize } = require('./dist/config/database');

async function updateRemarkFields() {
  console.log('🔧 Updating remark fields to allow NULL...');

  try {
    // เชื่อมต่อฐานข้อมูล
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // อัปเดต leave_request table
    console.log('\n📝 Updating leave_request.remark field...');
    await sequelize.query(`
      ALTER TABLE leave_request 
      MODIFY COLUMN remark VARCHAR(255) NULL
    `);
    console.log('✅ leave_request.remark updated to allow NULL');

    // อัปเดต day_off table
    console.log('\n📝 Updating day_off.remark field...');
    await sequelize.query(`
      ALTER TABLE day_off 
      MODIFY COLUMN remark VARCHAR(255) NULL
    `);
    console.log('✅ day_off.remark updated to allow NULL');

    // ตรวจสอบโครงสร้างตาราง
    console.log('\n🔍 Checking table structures...');
    
    const [leaveRequestSchema] = await sequelize.query(`
      DESCRIBE leave_request
    `);
    
    const [dayOffSchema] = await sequelize.query(`
      DESCRIBE day_off
    `);

    console.log('\n📊 leave_request table structure:');
    leaveRequestSchema.forEach(column => {
      if (column.Field === 'remark') {
        console.log(`- ${column.Field}: ${column.Type}, Null: ${column.Null}, Default: ${column.Default}`);
      }
    });

    console.log('\n📊 day_off table structure:');
    dayOffSchema.forEach(column => {
      if (column.Field === 'remark') {
        console.log(`- ${column.Field}: ${column.Type}, Null: ${column.Null}, Default: ${column.Default}`);
      }
    });

    console.log('\n🎉 Database update completed successfully!');

  } catch (error) {
    console.error('❌ Error updating database:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

// เรียกใช้ฟังก์ชัน
updateRemarkFields();
