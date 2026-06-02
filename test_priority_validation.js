const http = require('http');

const postData = JSON.stringify({
  "name": "เช้า",
  "start_time": "08:00:00", 
  "end_time": "17:00:00",
  "roles_allowed": "Staff",
  "short_name": "ช",
  "color_code": "#90CAF9",
  "total_hours": 9,
  "normal_hours": 0,
  "ot_hours": 9,
  "count_as_fte": true,
  "count_as_working_hour": true,
  "is_active": true,
  "department_id": 27,
  "facility_id": 12,
  "group_tags": [11, 13, 14],
  "allowed_roles": [5],
  "group_tag_requirements": {
    "11": {
      "min_count": 0,
      "is_primary_group": false,
      "priority_level": 3
    },
    "13": {
      "min_count": 0,
      "is_primary_group": true,
      "priority_level": 1
    },
    "14": {
      "min_count": 0,
      "is_primary_group": false,
      "priority_level": 2
    }
  },
  "role_requirements": {
    "5": {
      "min_count": 0,
      "max_count": 0,
      "min_count_weekday": 1,
      "max_count_weekday": 1,
      "min_count_weekend": 1,
      "max_count_weekend": 1
    },
    "30": {
      "min_count": 0,
      "max_count": 0,
      "min_count_weekday": 1,
      "max_count_weekday": 1,
      "min_count_weekend": 1,
      "max_count_weekend": 1
    }
  }
});

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
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`Body: ${chunk}`);
  });
  res.on('end', () => {
    console.log('Response ended');
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
