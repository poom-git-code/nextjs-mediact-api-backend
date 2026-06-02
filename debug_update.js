const axios = require('axios');

const debugShiftTypeUpdate = async () => {
  console.log('🔍 Debug Shift Type Update Process');
  
  try {
    // ข้อมูลง่ายๆ สำหรับสร้าง shift type
    const createData = {
      "name": "Debug Test",
      "start_time": "08:00:00",
      "end_time": "17:00:00",
      "roles_allowed": "Staff",
      "short_name": "DBG",
      "color_code": "#FFD1DC",
      "total_hours": 9,
      "normal_hours": 9,
      "ot_hours": 0,
      "count_as_fte": true,
      "count_as_working_hour": true,
      "is_active": true,
      "department_id": 82,
      "facility_id": 30,
      "allowed_roles": [5],
      "role_requirements": {
        "5": {"min_count": 1, "max_count": 3}
      }
    };

    console.log('\n📝 Step 1: Creating shift type...');
    console.log('Create data:', JSON.stringify(createData, null, 2));
    
    const createResponse = await axios.post('http://localhost:3001/api/shift-types', createData);
    
    if (createResponse.status === 201) {
      const shiftTypeId = createResponse.data.data.id;
      console.log(`✅ Created shift type ID: ${shiftTypeId}`);
      
      // ดูข้อมูลหลังสร้าง
      console.log('\n🔍 Step 2: Checking created data...');
      const getCreatedResponse = await axios.get(`http://localhost:3001/api/shift-types/${shiftTypeId}/relations`);
      console.log('Created data role requirements:', JSON.stringify(getCreatedResponse.data.role_requirements || {}, null, 2));
      
      // ทดสอบ update
      const updateData = {
        "name": "M1 Updated",
        "short_name": "M1U",
        "color_code": "#B5E7A0",
        "count_as_fte": false,
        "allowed_roles": [5],
        "role_requirements": {
          "5": {"min_count": 2, "max_count": 6}
        }
      };

      console.log('\n📝 Step 3: Updating shift type...');
      console.log('Update data:', JSON.stringify(updateData, null, 2));
      
      const updateResponse = await axios.put(`http://localhost:3001/api/shift-types/${shiftTypeId}`, updateData);
      
      if (updateResponse.status === 200) {
        console.log('✅ Update response:', updateResponse.data);
        
        // ดูข้อมูลหลัง update
        console.log('\n🔍 Step 4: Checking updated data...');
        const getUpdatedResponse = await axios.get(`http://localhost:3001/api/shift-types/${shiftTypeId}/relations`);
        
        console.log('\n📊 Final Results:');
        console.log(`Name: ${getUpdatedResponse.data.name}`);
        console.log(`Short Name: ${getUpdatedResponse.data.short_name}`);
        console.log(`Color: ${getUpdatedResponse.data.color_code}`);
        console.log(`Count as FTE: ${getUpdatedResponse.data.count_as_fte}`);
        
        console.log('\n📊 Updated Role Requirements:');
        console.log(JSON.stringify(getUpdatedResponse.data.role_requirements || {}, null, 2));
        
        console.log('\n📊 Raw Shift Type Roles:');
        if (getUpdatedResponse.data.shift_type_roles) {
          getUpdatedResponse.data.shift_type_roles.forEach(role => {
            console.log(`- Role ID: ${role.role_id}, Min: ${role.min_count}, Max: ${role.max_count}, Active: ${role.is_active}`);
          });
        } else {
          console.log('No shift_type_roles found');
        }
        
      } else {
        console.log('❌ Update failed with status:', updateResponse.status);
      }
    }

  } catch (error) {
    console.error('❌ Error occurred:');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Connection refused - Server is not running on http://localhost:3001');
      console.log('💡 Please start the server first with: npm start');
      return;
    }
    
    if (error.response) {
      console.error(`📊 HTTP Status: ${error.response.status}`);
      console.error('📊 Response data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('📊 No response received');
      console.error('📊 Request:', error.request);
    } else {
      console.error('📊 Error message:', error.message);
    }
    
    if (error.response?.status === 400) {
      console.log('\n🔧 Validation Error Details:');
      console.log(JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.response?.status === 500) {
      console.log('\n💥 Server Error Details:');
      console.log(JSON.stringify(error.response.data, null, 2));
    }
  }
};

console.log('Starting debug test...');
debugShiftTypeUpdate();
