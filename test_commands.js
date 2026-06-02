const axios = require('axios');

const simpleUpdateTest = async () => {
  console.log('🚀 Simple Update Test');
  
  const testData = {
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

  console.log('\n📝 Test data:', JSON.stringify(testData, null, 2));
  console.log('\n💡 Make sure to start server first: npm start');
  console.log('💡 Then test with: curl -X POST http://localhost:3001/api/shift-types -H "Content-Type: application/json" -d \'', JSON.stringify(testData), '\'');
  
  // แสดงวิธีการ update
  console.log('\n📝 To update, use shift type ID from creation response:');
  console.log('curl -X PUT http://localhost:3001/api/shift-types/[ID] -H "Content-Type: application/json" -d \'', JSON.stringify(testData), '\'');
  
  // แสดงวิธีการดูข้อมูล relationships
  console.log('\n📝 To view with relationships:');
  console.log('curl http://localhost:3001/api/shift-types/[ID]/relations');
};

simpleUpdateTest();
