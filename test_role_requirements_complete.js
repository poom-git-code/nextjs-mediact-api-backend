const axios = require('axios');

const testRoleRequirements = async () => {
  console.log('🚀 Testing Role Requirements Feature');
  
  try {
    // ทดสอบสร้าง shift type พร้อม role_requirements
    const createData = {
      "name": "Test Shift with Role Requirements",
      "start_time": "08:00:00",
      "end_time": "17:00:00",
      "roles_allowed": "Staff",
      "short_name": "TSRR",
      "color_code": "#FFD1DC",
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
      "group_tags": [2, 3],
      "allowed_roles": [5],
      "group_tag_requirements": {
        "2": {"min_count": 1},
        "3": {"min_count": 1}
      },
      "role_requirements": {
        "5": {"min_count": 1, "max_count": 5}
      }
    };

    console.log('\n📝 Creating shift type with role requirements...');
    const createResponse = await axios.post('http://localhost:3001/api/shift-types', createData);
    
    if (createResponse.status === 201) {
      console.log('✅ Shift type created successfully!');
      const shiftTypeId = createResponse.data.id;
      console.log(`📋 Shift Type ID: ${shiftTypeId}`);
      
      // ทดสอบดึงข้อมูล shift type พร้อม relationships
      console.log('\n🔍 Fetching shift type with relationships...');
      const getResponse = await axios.get(`http://localhost:3001/api/shift-types/${shiftTypeId}/relations`);
      
      if (getResponse.status === 200) {
        console.log('✅ Successfully retrieved shift type with relationships!');
        console.log('\n📊 Role Requirements:');
        console.log(JSON.stringify(getResponse.data.role_requirements || {}, null, 2));
        
        console.log('\n📊 Group Tag Requirements:');
        console.log(JSON.stringify(getResponse.data.group_tag_requirements || {}, null, 2));
        
        console.log('\n📊 Shift Type Roles:');
        if (getResponse.data.shift_type_roles) {
          getResponse.data.shift_type_roles.forEach(role => {
            console.log(`- Role ID: ${role.role_id}, Min: ${role.min_count}, Max: ${role.max_count}`);
          });
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      console.log('\n🔧 Validation Error Details:');
      console.log(error.response.data);
    }
  }
};

console.log('Starting role requirements test...');
testRoleRequirements();
