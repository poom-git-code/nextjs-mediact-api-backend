const request = require('supertest');
const app = require('./src/app').default;

// ข้อมูลทดสอบสำหรับ group_tag_requirements ในรูปแบบใหม่ (ใช้เฉพาะ min)
const testData = {
  // Test case 1: ไม่มีข้อจำกัดอะไร (ไม่ส่ง group_tag_requirements)
  shiftType1: {
    name: "Test Shift No Requirements",
    department_id: 1,
    start_time: "08:00:00",
    end_time: "17:00:00",
    total_hours: 8.0,
    role_ids: [1, 2],
    group_tag_ids: [1, 2, 3]
    // ไม่มี group_tag_requirements
  },

  // Test case 2: มีข้อจำกัดบางส่วน
  shiftType2: {
    name: "Test Shift Partial Requirements",
    department_id: 1,
    start_time: "08:00:00",
    end_time: "17:00:00",
    total_hours: 8.0,
    role_ids: [1, 2],
    group_tag_ids: [1, 2, 3],
    group_tag_requirements: {
      "1": { min: 2 },  // group_tag_id 1 ต้องมีอย่างน้อย 2 คน
      "3": { min: 1 }   // group_tag_id 3 ต้องมีอย่างน้อย 1 คน
      // group_tag_id 2 ไม่มีข้อจำกัด
    }
  },

  // Test case 3: ส่งค่า 0 หรือไม่ส่ง min (ไม่มีข้อจำกัด)
  shiftType3: {
    name: "Test Shift Zero Requirements",
    department_id: 1,
    start_time: "08:00:00",
    end_time: "17:00:00",
    total_hours: 8.0,
    role_ids: [1, 2],
    group_tag_ids: [1, 2],
    group_tag_requirements: {
      "1": { },        // ไม่ส่ง min = ไม่มีข้อจำกัด
      "2": { min: 0 }  // min = 0 = ไม่มีข้อจำกัด (แต่จะไม่ validate ผ่านเพราะ min ต้อง >= 1)
    }
  }
};

async function testGroupTagRequirements() {
  console.log('🧪 Testing Group Tag Requirements (Simple Min Only)...\n');

  // Test Case 1: ไม่มีข้อจำกัด
  console.log('📋 Test Case 1: No Requirements');
  try {
    const response1 = await request(app)
      .post('/api/shift-types')
      .send(testData.shiftType1)
      .set('Authorization', 'Bearer your-test-token')
      .expect(201);

    console.log('✅ Created shift type without requirements');
    console.log('Response data:', JSON.stringify(response1.body, null, 2));
    
    // ดึงข้อมูลมาดู
    const getResponse1 = await request(app)
      .get(`/api/shift-types/${response1.body.data.id}`)
      .set('Authorization', 'Bearer your-test-token')
      .expect(200);

    console.log('📋 Retrieved data:', JSON.stringify(getResponse1.body.data.group_tag_requirements, null, 2));
  } catch (error) {
    console.log('❌ Test Case 1 failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test Case 2: มีข้อจำกัดบางส่วน
  console.log('📋 Test Case 2: Partial Requirements');
  try {
    const response2 = await request(app)
      .post('/api/shift-types')
      .send(testData.shiftType2)
      .set('Authorization', 'Bearer your-test-token')
      .expect(201);

    console.log('✅ Created shift type with partial requirements');
    console.log('Response data:', JSON.stringify(response2.body, null, 2));
    
    // ดึงข้อมูลมาดู
    const getResponse2 = await request(app)
      .get(`/api/shift-types/${response2.body.data.id}`)
      .set('Authorization', 'Bearer your-test-token')
      .expect(200);

    console.log('📋 Retrieved data:', JSON.stringify(getResponse2.body.data.group_tag_requirements, null, 2));
  } catch (error) {
    console.log('❌ Test Case 2 failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test Case 3: ทดสอบ validation
  console.log('📋 Test Case 3: Zero/Empty Requirements (Should handle gracefully)');
  try {
    const response3 = await request(app)
      .post('/api/shift-types')
      .send(testData.shiftType3)
      .set('Authorization', 'Bearer your-test-token');

    if (response3.status === 201) {
      console.log('✅ Created shift type with zero requirements');
      console.log('Response data:', JSON.stringify(response3.body, null, 2));
    } else {
      console.log('⚠️ Validation error (expected):', response3.body);
    }
  } catch (error) {
    console.log('⚠️ Test Case 3 validation error (expected):', error.message);
  }

  console.log('\n🏁 Group Tag Requirements Tests Completed!');
}

// ถ้ารันไฟล์นี้โดยตรง
if (require.main === module) {
  testGroupTagRequirements().catch(console.error);
}

module.exports = { testGroupTagRequirements };
