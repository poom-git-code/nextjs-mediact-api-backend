// Simple test without database - just test the functions
const testShiftTypeData = {
  "name": "M1",
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

function testDataProcessing() {
  console.log('🧪 Testing Data Processing Logic...\n');
  
  const { group_tag_requirements, group_tags, allowed_roles } = testShiftTypeData;
  
  // Test processing group_tag_requirements
  console.log('📋 Original group_tag_requirements:');
  console.log(JSON.stringify(group_tag_requirements, null, 2));
  
  // Simulate processing logic
  const processedRequirements = {};
  
  group_tags.forEach(groupTagId => {
    const requirements = group_tag_requirements && group_tag_requirements[groupTagId.toString()];
    if (requirements) {
      const minCount = requirements.min || requirements.min_count || 0;
      if (minCount > 0) {
        processedRequirements[groupTagId.toString()] = { min: minCount };
      }
    }
  });
  
  console.log('\n📋 Processed requirements:');
  console.log(JSON.stringify(processedRequirements, null, 2));
  
  // Test data structure for database insert
  const groupTagData = group_tags.map(groupTagId => {
    const requirements = group_tag_requirements && group_tag_requirements[groupTagId.toString()];
    const minCount = requirements?.min || requirements?.min_count || 0;
    
    return {
      shift_type_id: 999, // mock ID
      user_group_tag_id: groupTagId,
      min_count: minCount,
      is_active: true,
      created_by: 1,
      updated_by: 1,
    };
  });
  
  console.log('\n📋 Group tag data for database:');
  console.log(JSON.stringify(groupTagData, null, 2));
  
  // Test role data
  const roleData = allowed_roles.map(roleId => ({
    shift_type_id: 999, // mock ID
    role_id: roleId,
    is_active: true,
    created_by: 1,
    updated_by: 1,
  }));
  
  console.log('\n📋 Role data for database:');
  console.log(JSON.stringify(roleData, null, 2));
  
  console.log('\n✅ Data processing test completed successfully!');
}

// ถ้ารันไฟล์นี้โดยตรง
if (require.main === module) {
  testDataProcessing();
}

module.exports = { testDataProcessing };
