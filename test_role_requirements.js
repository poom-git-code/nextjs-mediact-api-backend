const axios = require('axios');

const testShiftTypeWithRoleRequirements = async () => {
  try {
    const shiftTypeData = {
      "name": "xx",
      "start_time": "08:00:00",
      "end_time": "17:00:00",
      "roles_allowed": "Staff",
      "short_name": "xx",
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

    console.log('Testing shift type creation with role requirements...');
    console.log('Request data:', JSON.stringify(shiftTypeData, null, 2));

    const response = await axios.post('http://localhost:3001/api/shift-types', shiftTypeData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // อาจต้องใส่ token ถ้าใช้ auth
      }
    });

    console.log('✅ Success! Shift type created with role requirements');
    console.log('Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Error creating shift type:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

testShiftTypeWithRoleRequirements();
