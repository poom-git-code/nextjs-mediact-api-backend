const request = require('supertest');
const app = require('./src/app').default;

// ข้อมูลทดสอบจากผู้ใช้
const testShiftTypeData = {
  "name": "M1",
  "start_time": "08:00:00",
  "end_time": "17:00:00",
  "roles_allowed": "Staff",
  "short_name": "M1",
  "color_code": "#B5E7A0",
  "total_hours": 9,
  "normal_hours": 9,
  "ot_hours": 0,
  "count_as_fte": true,
  "count_as_working_hour": true,
  "min_staff_weekday": 1,
  "max_staff_weekday": 1,
  "min_staff_weekend": 1,
  "max_staff_weekend": 1,
  "required_senior_count": 1,
  "is_active": true,
  "department_id": 82,
  "facility_id": 30,
  "group_tags": [11, 15, 16],
  "allowed_roles": [5, 30],
  "group_tag_requirements": {
    "11": { "min_count": 1 },
    "15": { "min_count": 1 },
    "16": { "min_count": 1 }
  }
};

async function testRealShiftTypeCreation() {
  console.log('🧪 Testing Real Shift Type Creation with Roles and Group Tags...\n');
  
  try {
    console.log('📋 Creating shift type with data:');
    console.log(JSON.stringify(testShiftTypeData, null, 2));
    
    const response = await request(app)
      .post('/api/shift-types')
      .send(testShiftTypeData)
      .set('Authorization', 'Bearer your-test-token')
      .expect(201);

    console.log('✅ Shift type created successfully!');
    console.log('Response:', JSON.stringify(response.body, null, 2));
    
    const shiftTypeId = response.body.data.id;
    
    // ดึงข้อมูล shift type พร้อม relationships
    console.log('\n📋 Fetching shift type with relationships...');
    const getResponse = await request(app)
      .get(`/api/shift-types/${shiftTypeId}`)
      .set('Authorization', 'Bearer your-test-token')
      .expect(200);

    console.log('✅ Retrieved shift type with relationships:');
    console.log('Roles:', JSON.stringify(getResponse.body.data.shift_type_roles, null, 2));
    console.log('Group Tags:', JSON.stringify(getResponse.body.data.shift_type_group_tags, null, 2));
    console.log('Group Tag Requirements:', JSON.stringify(getResponse.body.data.group_tag_requirements, null, 2));
    
    // ตรวจสอบว่าข้อมูลถูกบันทึกครบถ้วน
    const roles = getResponse.body.data.shift_type_roles || [];
    const groupTags = getResponse.body.data.shift_type_group_tags || [];
    
    console.log('\n🔍 Validation Results:');
    console.log(`- Roles saved: ${roles.length} (expected: 2)`);
    console.log(`- Group tags saved: ${groupTags.length} (expected: 3)`);
    
    if (roles.length === 2 && groupTags.length === 3) {
      console.log('✅ All relationships saved correctly!');
    } else {
      console.log('❌ Some relationships were not saved correctly.');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    if (error.response) {
      console.log('Error response:', JSON.stringify(error.response.body, null, 2));
    }
  }

  console.log('\n🏁 Real Shift Type Creation Test Completed!');
}

// ถ้ารันไฟล์นี้โดยตรง
if (require.main === module) {
  testRealShiftTypeCreation().catch(console.error);
}

module.exports = { testRealShiftTypeCreation };
