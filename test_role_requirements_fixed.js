const http = require('http');

// Test data with role requirements including max_count_weekday and max_count_weekend
const testData = {
  "name": "7-20 ห้องผ่าตัด",
  "start_time": "07:00:00",
  "end_time": "20:00:00",
  "roles_allowed": "Staff",
  "short_name": "7-20",
  "color_code": "#FFF8E1",
  "total_hours": 13,
  "normal_hours": 13,
  "ot_hours": 0,
  "count_as_fte": true,
  "count_as_working_hour": true,
  "is_active": true,
  "department_id": 27,
  "facility_id": 12,
  "group_tags": [11, 12, 14, 15, 16],
  "allowed_roles": [5, 30],
  "group_tag_requirements": {
    "11": {
      "min_count": 0,
      "priority_level": 1,
      "is_primary_group": false
    },
    "12": {
      "min_count": 0,
      "priority_level": 1,
      "is_primary_group": false
    },
    "14": {
      "min_count": 1,
      "priority_level": 1,
      "is_primary_group": false
    },
    "15": {
      "min_count": 0,
      "priority_level": 1,
      "is_primary_group": false
    },
    "16": {
      "min_count": 0,
      "priority_level": 1,
      "is_primary_group": false
    }
  },
  "role_requirements": {
    "5": {
      "min_count": 0,
      "max_count": 0,
      "min_count_weekday": 3,
      "max_count_weekday": 5,
      "min_count_weekend": 4,
      "max_count_weekend": 5
    },
    "30": {
      "min_count": 0,
      "max_count": 0,
      "min_count_weekday": 1,
      "max_count_weekday": 2,
      "min_count_weekend": 2,
      "max_count_weekend": 2
    }
  }
};

async function testCreateShiftType() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(testData);
    
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/shift-types',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyMzEsInVzZXJuYW1lIjoidGVzdCIsInJvbGVfaWQiOjIsInJvbGVfbmFtZSI6IkFkbWluIiwiaWF0IjoxNzMxMjc1NzE4LCJleHAiOjE3MzEzNjIxMTh9.SaOfHgBNfg5a5Mwv5n0o_GvzjSgMRVECMCzKSQJjOKA'
      }
    };

    const req = http.request(options, (res) => {
      console.log(`POST Status: ${res.statusCode}`);
      
      let responseBody = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(responseBody);
          console.log('CREATE Response:', JSON.stringify(result, null, 2));
          resolve(result);
        } catch (e) {
          console.log('CREATE Response (raw):', responseBody);
          resolve(responseBody);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`CREATE Error: ${e.message}`);
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function testGetShiftType(shiftTypeId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: `/shift-types/${shiftTypeId}`,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyMzEsInVzZXJuYW1lIjoidGVzdCIsInJvbGVfaWQiOjIsInJvbGVfbmFtZSI6IkFkbWluIiwiaWF0IjoxNzMxMjc1NzE4LCJleHAiOjE3MzEzNjIxMTh9.SaOfHgBNfg5a5Mwv5n0o_GvzjSgMRVECMCzKSQJjOKA'
      }
    };

    const req = http.request(options, (res) => {
      console.log(`GET Status: ${res.statusCode}`);
      
      let responseBody = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(responseBody);
          console.log('GET Response:', JSON.stringify(result, null, 2));
          
          // Check if role requirement fields are saved
          if (result.data && result.data.roles) {
            console.log('\n=== Role Requirements Check ===');
            result.data.roles.forEach(role => {
              console.log(`Role ${role.role_id}:`);
              console.log(`  - min_count: ${role.min_count}`);
              console.log(`  - max_count: ${role.max_count}`);
              console.log(`  - min_count_weekday: ${role.min_count_weekday}`);
              console.log(`  - max_count_weekday: ${role.max_count_weekday}`);
              console.log(`  - min_count_weekend: ${role.min_count_weekend}`);
              console.log(`  - max_count_weekend: ${role.max_count_weekend}`);
            });
          }
          
          // Check priority fields
          if (result.data && result.data.groupTags) {
            console.log('\n=== Priority Fields Check ===');
            result.data.groupTags.forEach(tag => {
              console.log(`Group Tag ${tag.user_group_tag_id}:`);
              console.log(`  - is_primary_group: ${tag.is_primary_group}`);
              console.log(`  - priority_level: ${tag.priority_level}`);
              console.log(`  - min_count: ${tag.min_count}`);
            });
          }
          
          resolve(result);
        } catch (e) {
          console.log('GET Response (raw):', responseBody);
          resolve(responseBody);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`GET Error: ${e.message}`);
      reject(e);
    });

    req.end();
  });
}

// Run the test
(async () => {
  try {
    console.log('=== Testing Role Requirements and Priority Fields ===\n');
    
    const createResult = await testCreateShiftType();
    
    if (createResult && createResult.data && createResult.data.id) {
      const shiftTypeId = createResult.data.id;
      console.log(`\nShift Type created with ID: ${shiftTypeId}`);
      
      // Wait a moment then get the data
      setTimeout(async () => {
        await testGetShiftType(shiftTypeId);
      }, 1000);
    } else {
      console.log('Failed to create shift type or get ID');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
})();
