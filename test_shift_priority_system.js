/**
 * Test Script สำหรับระบบจัดเวรตาม Priority
 * 
 * ตอนนี้ข้อมูล priority ส่งมาพร้อมกับ shift type data แล้ว
 * ไม่ต้องมี endpoint แยก
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3600/api';
const authToken = 'YOUR_AUTH_TOKEN_HERE'; // แทนที่ด้วย token จริง

const headers = {
  'Authorization': `Bearer ${authToken}`,
  'Content-Type': 'application/json'
};

async function testCreateShiftTypeWithPriority() {
  console.log('🚀 Testing Create Shift Type with Priority Settings\n');

  try {
    // ตัวอย่างการสร้าง shift type พร้อม priority settings
    const shiftTypeData = {
      name: "Morning Shift with Priority",
      department_id: 27,
      facility_id: 12,
      start_time: "07:00:00",
      end_time: "15:00:00",
      short_name: "AM-PRI",
      color_code: "#B3E5FC",
      
      // Group Tags พร้อม Priority Settings
      group_tags: [1, 2], // Group IDs
      group_tag_requirements: {
        "1": {
          min_count: 2,
          priority_level: 1,
          is_primary_group: true
        },
        "2": {
          min_count: 1,
          priority_level: 2,
          is_primary_group: false
        }
      },
      
      // Roles
      allowed_roles: [5, 30], // Nurse, Nursing Assistant
      role_requirements: {
        "5": {
          min_count: 2,
          max_count: 4
        },
        "30": {
          min_count: 1,
          max_count: 2
        }
      }
    };

    console.log('Creating shift type with data:', JSON.stringify(shiftTypeData, null, 2));

    const createResponse = await axios.post(
      `${BASE_URL}/shift-types`,
      shiftTypeData,
      { headers }
    );

    console.log('✅ Shift type created successfully!');
    console.log('Response:', JSON.stringify(createResponse.data, null, 2));

    const shiftTypeId = createResponse.data.data?.id || createResponse.data.id;

    // ตรวจสอบ shift type ที่สร้างขึ้น พร้อม priority data
    console.log('\n📋 Getting shift type with relations...');
    const getResponse = await axios.get(
      `${BASE_URL}/shift-types/${shiftTypeId}/relations`,
      { headers }
    );

    console.log('Shift Type with Priority Data:');
    console.log('- Basic Info:', {
      id: getResponse.data.data.id,
      name: getResponse.data.data.name,
      department_id: getResponse.data.data.department_id
    });
    
    console.log('- Group Tags with Priority:', 
      getResponse.data.data.shift_type_group_tags?.map(gt => ({
        group_id: gt.user_group_tag_id,
        min_count: gt.min_count,
        priority_level: gt.priority_level,
        is_primary_group: gt.is_primary_group
      }))
    );

    return shiftTypeId;

  } catch (error) {
    console.error('❌ Error testing create shift type:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
    }
  }
}

async function testUpdateShiftTypeWithPriority(shiftTypeId) {
  console.log('\n🔄 Testing Update Shift Type with Priority Settings\n');

  try {
    // ตัวอย่างการอัปเดต priority settings
    const updateData = {
      name: "Updated Morning Shift",
      group_tag_requirements: {
        "1": {
          min_count: 3,
          priority_level: 1,
          is_primary_group: true
        },
        "2": {
          min_count: 2,
          priority_level: 2,
          is_primary_group: false
        },
        "3": {
          min_count: 1,
          priority_level: 3,
          is_primary_group: false
        }
      }
    };

    console.log('Updating shift type with data:', JSON.stringify(updateData, null, 2));

    const updateResponse = await axios.put(
      `${BASE_URL}/shift-types/${shiftTypeId}`,
      updateData,
      { headers }
    );

    console.log('✅ Shift type updated successfully!');
    console.log('Response:', JSON.stringify(updateResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error testing update shift type:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
    }
  }
}

async function testShiftAssignment() {
  console.log('\n⚡ Testing Shift Assignment with Priority Logic\n');

  try {
    // ใช้ฟังก์ชัน assign ที่อยู่ใน service (ถ้ามี endpoint)
    const assignmentRequest = {
      shift_type_id: 1,
      date: '2025-09-15',
      required_roles: [
        {
          role_id: 5, // Nurse
          min_count: 2,
          max_count: 3
        },
        {
          role_id: 30, // Nursing Assistant
          min_count: 1,
          max_count: 2
        }
      ]
    };

    console.log('Assignment request:', JSON.stringify(assignmentRequest, null, 2));
    
    // หมายเหตุ: endpoint นี้ยังต้องเพิ่มใน service
    console.log('📝 Note: Assignment endpoint would be called here');
    console.log('    Expected URL: POST /shift-types/assign-with-priority');

  } catch (error) {
    console.error('❌ Error testing assignment:', error.message);
  }
}

// เรียกใช้ functions
async function runTests() {
  console.log('🎯 Priority Management is now integrated into Shift Type endpoints!\n');
  console.log('📌 Key Changes:');
  console.log('- ข้อมูล priority ส่งใน group_tag_requirements');
  console.log('- ไม่ต้องมี endpoint แยก');
  console.log('- ข้อมูล priority มาพร้อมกับ shift type data\n');

  console.log('🔧 Before testing:');
  console.log('1. Update authToken variable');
  console.log('2. Run migration to add priority fields');
  console.log('3. Make sure you have valid group_tags and roles\n');

  const shiftTypeId = await testCreateShiftTypeWithPriority();
  
  if (shiftTypeId) {
    await testUpdateShiftTypeWithPriority(shiftTypeId);
  }
  
  await testShiftAssignment();
}

// เรียกใช้
runTests();

/**
 * ตัวอย่างข้อมูลที่ส่งไป:
 * 
 * {
 *   "name": "Morning Shift",
 *   "department_id": 27,
 *   "facility_id": 12,
 *   "group_tags": [1, 2],
 *   "group_tag_requirements": {
 *     "1": {
 *       "min_count": 2,
 *       "priority_level": 1,
 *       "is_primary_group": true
 *     },
 *     "2": {
 *       "min_count": 1,
 *       "priority_level": 2,
 *       "is_primary_group": false
 *     }
 *   }
 * }
 * 
 * ตัวอย่างข้อมูลที่ได้กลับมา:
 * 
 * {
 *   "shift_type_group_tags": [
 *     {
 *       "user_group_tag_id": 1,
 *       "min_count": 2,
 *       "priority_level": 1,
 *       "is_primary_group": true
 *     }
 *   ]
 * }
 */

module.exports = {
  testCreateShiftTypeWithPriority,
  testUpdateShiftTypeWithPriority,
  testShiftAssignment
};
