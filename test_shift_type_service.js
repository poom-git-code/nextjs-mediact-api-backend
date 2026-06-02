// Simple test for shift type service functionality
const ShiftTypeService = require('./src/services/shiftTypeService');

async function testShiftTypeService() {
  console.log('🧪 Testing Shift Type Service Functions...\n');
  
  const testData = {
    "name": "M1 Test",
    "start_time": "08:00:00",
    "end_time": "17:00:00",
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
    "department_id": 1, // ใช้ department_id ที่มีจริง
    "facility_id": 1,   // ใช้ facility_id ที่มีจริง
    "group_tags": [1, 2], // ใช้ group_tag_ids ที่มีจริง
    "allowed_roles": [1, 2], // ใช้ role_ids ที่มีจริง
    "group_tag_requirements": {
      "1": { "min_count": 1 },
      "2": { "min_count": 2 }
    }
  };

  try {
    console.log('📋 Creating shift type...');
    console.log('Input data:', JSON.stringify(testData, null, 2));
    
    const createdShiftType = await ShiftTypeService.createShiftType(testData, 1);
    console.log('✅ Shift type created:', createdShiftType.toJSON());
    
    const shiftTypeId = createdShiftType.id;
    
    console.log('\n📋 Retrieving shift type with relationships...');
    const shiftTypeWithRelations = await ShiftTypeService.getShiftTypeWithRelations(shiftTypeId);
    console.log('✅ Retrieved shift type:', JSON.stringify(shiftTypeWithRelations, null, 2));
    
    // ตรวจสอบผลลัพธ์
    const roles = shiftTypeWithRelations.shift_type_roles || [];
    const groupTags = shiftTypeWithRelations.shift_type_group_tags || [];
    const requirements = shiftTypeWithRelations.group_tag_requirements || {};
    
    console.log('\n🔍 Analysis:');
    console.log(`- Roles count: ${roles.length}`);
    console.log(`- Group tags count: ${groupTags.length}`);
    console.log(`- Requirements: ${JSON.stringify(requirements)}`);
    
    // ทดสอบการ update
    console.log('\n📋 Testing update...');
    const updateData = {
      name: "M1 Updated",
      group_tag_requirements: {
        "1": { "min_count": 3 },
        "2": { "min_count": 1 }
      }
    };
    
    const updatedShiftType = await ShiftTypeService.updateShiftType(shiftTypeId, updateData, 1);
    console.log('✅ Shift type updated:', updatedShiftType.toJSON());
    
    const updatedShiftTypeWithRelations = await ShiftTypeService.getShiftTypeWithRelations(shiftTypeId);
    console.log('✅ Updated requirements:', JSON.stringify(updatedShiftTypeWithRelations.group_tag_requirements, null, 2));
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('Stack trace:', error.stack);
  }
  
  console.log('\n🏁 Service Test Completed!');
}

// ถ้ารันไฟล์นี้โดยตรง
if (require.main === module) {
  testShiftTypeService().catch(console.error);
}

module.exports = { testShiftTypeService };
