// ตรวจสอบ database schema
const mysql = require('mysql2/promise');

const checkDatabaseSchema = async () => {
  console.log('🔍 Checking database schema for shift_type_roles table');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'password', // แก้ไขเป็น password ที่ถูกต้อง
      database: 'mediact_db'
    });

    console.log('✅ Connected to database');

    // ตรวจสอบ structure ของ table shift_type_roles
    console.log('\n📊 Checking shift_type_roles table structure...');
    const [columns] = await connection.execute('DESCRIBE shift_type_roles');
    
    console.log('Columns in shift_type_roles:');
    columns.forEach(column => {
      console.log(`- ${column.Field}: ${column.Type} (${column.Null === 'YES' ? 'nullable' : 'not null'})`);
    });

    // ตรวจสอบว่ามี min_count และ max_count columns หรือไม่
    const hasMinCount = columns.some(col => col.Field === 'min_count');
    const hasMaxCount = columns.some(col => col.Field === 'max_count');

    console.log(`\n📊 Has min_count column: ${hasMinCount}`);
    console.log(`📊 Has max_count column: ${hasMaxCount}`);

    if (!hasMinCount || !hasMaxCount) {
      console.log('\n❌ Missing required columns! Need to run SQL script:');
      console.log('mysql -u root -p mediact_db < sql/alter_shift_type_roles_add_count_fields.sql');
    } else {
      console.log('\n✅ All required columns exist');
    }

    // ตรวจสอบข้อมูลที่มีอยู่
    console.log('\n📊 Sample data from shift_type_roles:');
    const [rows] = await connection.execute('SELECT * FROM shift_type_roles LIMIT 5');
    console.log(rows);

    await connection.end();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('❌ Access denied - check database credentials');
      console.log('💡 Update the password in this script or run manually:');
      console.log('mysql -u root -p mediact_db');
      console.log('DESCRIBE shift_type_roles;');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused - MySQL server is not running');
    } else {
      console.error('❌ Database error:', error.message);
    }
  }
};

checkDatabaseSchema();
