const axios = require('axios');

const testShiftTypeUpdate = async () => {
  console.log('🚀 Testing Shift Type Update with Role Requirements');
  
  try {
    // ข้อมูลสำหรับสร้าง shift type ใหม่
    const createData = {
      "name": "Test Update Shift",
      "start_time": "08:00:00",
      "end_time": "17:00:00",
      "roles_allowed": "Staff",
      "short_name": "TUS",
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
      "group_tags": [2],
      "allowed_roles": [5],
      "group_tag_requirements": {
        "2": {"min_count": 1}
      },
      "role_requirements": {
        "5": {"min_count": 1, "max_count": 3}
      }
    };

    // ข้อมูลสำหรับ update (เปลี่ยนจากข้อมูลที่ user ให้มา)
    const updateData = {
      "name": "M1",
      "start_time": "08:00:00",
      "end_time": "17:00:00",
      "roles_allowed": "Staff",
      "short_name": "M1",
      "color_code": "#B5E7A0",
      "total_hours": 9,
      "normal_hours": 9,
      "ot_hours": 0,
      "count_as_fte": false,
      "count_as_working_hour": true,
      "min_staff_weekday": 1,
      "max_staff_weekday": 1,
      "min_staff_weekend": 1,
      "max_staff_weekend": 1,
      "required_senior_count": 1,
      "is_active": true,
      "department_id": 82,
      "facility_id": 30,
      "group_tags": [9, 10],
      "allowed_roles": [5],
      "group_tag_requirements": {
        "9": {"min_count": 1},
        "10": {"min_count": 1}
      },
      "role_requirements": {
        "5": {"min_count": 1, "max_count": 5}
      }
    };

    console.log('\n📝 Step 1: Creating shift type...');
    const createResponse = await axios.post('http://localhost:3001/api/shift-types', createData);
    
    if (createResponse.status === 201) {
      const shiftTypeId = createResponse.data.data.id;
      console.log(`✅ Shift type created successfully! ID: ${shiftTypeId}`);
      
      console.log('\n📝 Step 2: Updating shift type with new role requirements...');
      const updateResponse = await axios.put(`http://localhost:3001/api/shift-types/${shiftTypeId}`, updateData);
      
      if (updateResponse.status === 200) {
        console.log('✅ Shift type updated successfully!');
        
        console.log('\n🔍 Step 3: Fetching updated shift type with relationships...');
        const getResponse = await axios.get(`http://localhost:3001/api/shift-types/${shiftTypeId}/relations`);
        
        if (getResponse.status === 200) {
          console.log('✅ Successfully retrieved updated shift type!');
          
          console.log('\n📊 Updated Data:');
          console.log(`Name: ${getResponse.data.name}`);
          console.log(`Short Name: ${getResponse.data.short_name}`);
          console.log(`Color: ${getResponse.data.color_code}`);
          console.log(`Count as FTE: ${getResponse.data.count_as_fte}`);
          
          console.log('\n📊 Updated Role Requirements:');
          console.log(JSON.stringify(getResponse.data.role_requirements || {}, null, 2));
          
          console.log('\n📊 Updated Group Tag Requirements:');
          console.log(JSON.stringify(getResponse.data.group_tag_requirements || {}, null, 2));
          
          console.log('\n📊 Shift Type Roles Details:');
          if (getResponse.data.shift_type_roles) {
            getResponse.data.shift_type_roles.forEach(role => {
              console.log(`- Role ID: ${role.role_id}`);
              console.log(`  Min Count: ${role.min_count}`);
              console.log(`  Max Count: ${role.max_count}`);
              console.log(`  Role Name: ${role.role?.name || 'N/A'}`);
            });
          }
          
          console.log('\n📊 Shift Type Group Tags Details:');
          if (getResponse.data.shift_type_group_tags) {
            getResponse.data.shift_type_group_tags.forEach(groupTag => {
              console.log(`- Group Tag ID: ${groupTag.user_group_tag_id}`);
              console.log(`  Min Count: ${groupTag.min_count}`);
              console.log(`  Tag Name: ${groupTag.user_group_tag?.name || 'N/A'}`);
            });
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      console.log('\n🔧 Validation Error Details:');
      console.log(JSON.stringify(error.response.data, null, 2));
    }
  }
};

console.log('Starting shift type update test...');
testShiftTypeUpdate();
