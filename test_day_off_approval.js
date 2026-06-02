const http = require('http');

// ข้อมูลการเชื่อมต่อ
const hostname = 'localhost';
const port = 3600;

// ฟังก์ชันสำหรับทำ HTTP request
function makeRequest(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (body && method !== 'GET') {
      const postData = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null
          };
          resolve(response);
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body && method !== 'GET') {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// ฟังก์ชันล็อกอิน
async function login() {
  console.log('🔑 Attempting to login...');
  
  const loginData = {
    identifier: 'H0110001',
    password: '11111111'
  };

  try {
    const response = await makeRequest('POST', '/auth/backend-login', {}, loginData);
    console.log('Login response status:', response.statusCode);
    console.log('Login response body:', response.body);
    
    if (response.statusCode === 200 && response.body && response.body.token) {
      console.log('✅ Login successful');
      return response.body.token;
    } else {
      console.log('❌ Login failed');
      return null;
    }
  } catch (error) {
    console.error('Login error:', error.message);
    return null;
  }
}

// ฟังก์ชันดึงรายการ day off requests
async function getDayOffRequests(token) {
  console.log('\n📋 Getting day off requests...');
  
  try {
    const response = await makeRequest('GET', '/day-off', {
      'Authorization': `Bearer ${token}`
    });
    
    console.log('Day off requests response status:', response.statusCode);
    console.log('Day off requests response body:', JSON.stringify(response.body, null, 2));
    
    return response.body;
  } catch (error) {
    console.error('Get day off requests error:', error.message);
    return null;
  }
}

// ฟังก์ชันทดสอบ approve day off
async function testApproveDayOff(token, dayOffId) {
  console.log(`\n✅ Testing approve day off with ID: ${dayOffId}`);
  
  const approvalData = {
    remark: 'ทดสอบการอนุมัติ day off'
  };

  try {
    const response = await makeRequest('PATCH', `/day-off/${dayOffId}/approve`, {
      'Authorization': `Bearer ${token}`
    }, approvalData);
    
    console.log('Approve day off response status:', response.statusCode);
    console.log('Approve day off response body:', JSON.stringify(response.body, null, 2));
    
    return response;
  } catch (error) {
    console.error('Approve day off error:', error.message);
    return null;
  }
}

// ฟังก์ชันสร้าง day off request ใหม่
async function createDayOffRequest(token) {
  console.log('\n➕ Creating new day off request...');
  
  const dayOffData = {
    request_user_id: 1,
    day_off_date: '2025-09-10',
    shift_time: 'morning',
    reason: 'ทดสอบระบบ day off',
    assign_user_id: 2
  };

  try {
    const response = await makeRequest('POST', '/day-off', {
      'Authorization': `Bearer ${token}`
    }, dayOffData);
    
    console.log('Create day off response status:', response.statusCode);
    console.log('Create day off response body:', JSON.stringify(response.body, null, 2));
    
    return response.body;
  } catch (error) {
    console.error('Create day off error:', error.message);
    return null;
  }
}

// ฟังก์ชันหลักสำหรับทดสอบ
async function main() {
  console.log('🧪 Starting Day Off Approval Test');
  console.log('='.repeat(50));

  // 1. ล็อกอิน
  const token = await login();
  if (!token) {
    console.log('❌ Cannot proceed without token');
    return;
  }

  // 2. ดูรายการ day off requests ที่มีอยู่
  const dayOffRequests = await getDayOffRequests(token);
  
  let testDayOffId = null;
  
  if (dayOffRequests && dayOffRequests.dayOffs && dayOffRequests.dayOffs.length > 0) {
    // หา pending request
    const pendingRequest = dayOffRequests.dayOffs.find(req => req.status === 'Pending');
    if (pendingRequest) {
      testDayOffId = pendingRequest.id;
      console.log(`\n🎯 Found pending day off request with ID: ${testDayOffId}`);
    } else {
      console.log('\n⚠️ No pending day off requests found');
    }
  } else {
    console.log('\n⚠️ No day off requests found or error getting requests');
  }

  // 3. ถ้าไม่มี pending request ให้สร้างใหม่
  if (!testDayOffId) {
    console.log('\n📝 Creating new day off request for testing...');
    const newDayOff = await createDayOffRequest(token);
    if (newDayOff && newDayOff.dayOff) {
      testDayOffId = newDayOff.dayOff.id;
      console.log(`✅ Created new day off request with ID: ${testDayOffId}`);
    } else {
      console.log('❌ Failed to create day off request');
      return;
    }
  }

  // 4. ทดสอบ approve day off
  if (testDayOffId) {
    const approvalResult = await testApproveDayOff(token, testDayOffId);
    
    if (approvalResult) {
      if (approvalResult.statusCode === 200) {
        console.log('\n🎉 Day off approval test PASSED');
      } else {
        console.log('\n❌ Day off approval test FAILED');
        console.log('Error details:', approvalResult.body);
      }
    }
  }

  // 5. ดูรายการอีกครั้งเพื่อยืนยันผล
  console.log('\n🔍 Getting updated day off requests...');
  await getDayOffRequests(token);

  console.log('\n='.repeat(50));
  console.log('🏁 Test completed');
}

// เรียกใช้ฟังก์ชันหลัก
main().catch(console.error);
