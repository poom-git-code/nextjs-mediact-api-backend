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

// ทดสอบ PATCH method โดยตรง
async function testPatchMethod() {
  console.log('🧪 Testing PATCH Method Support');
  console.log('='.repeat(50));

  // ทดสอบ PATCH request ไปยัง endpoint ที่มีอยู่
  console.log('\n1. ทดสอบ PATCH request ไปยัง /partner/day-off/1/approve');
  
  try {
    const response = await makeRequest('PATCH', '/partner/day-off/1/approve', {
      'Authorization': 'Bearer test-token'
    }, { remark: 'Test approval' });
    
    console.log('PATCH Response Status:', response.statusCode);
    console.log('PATCH Response Body:', response.body);
    
    if (response.statusCode === 405) {
      console.log('❌ Method Not Allowed - PATCH ไม่ได้รับการรองรับ');
    } else if (response.statusCode === 401) {
      console.log('✅ PATCH method ได้รับการรองรับ (แต่ไม่มี auth)');
    } else {
      console.log('✅ PATCH method ได้รับการรองรับ');
    }
    
  } catch (error) {
    console.error('Error testing PATCH:', error.message);
  }

  // ทดสอบ POST ที่ไม่ควรทำงาน
  console.log('\n2. ทดสอบ POST request ไปยัง /partner/day-off/1/approve (ควรได้ 405)');
  
  try {
    const response = await makeRequest('POST', '/partner/day-off/1/approve', {
      'Authorization': 'Bearer test-token'
    }, { remark: 'Test approval' });
    
    console.log('POST Response Status:', response.statusCode);
    console.log('POST Response Body:', response.body);
    
    if (response.statusCode === 405) {
      console.log('✅ ถูกต้อง - POST ไม่ได้รับการรองรับสำหรับ approve endpoint');
    } else {
      console.log('⚠️ POST ยังคงทำงานได้ - อาจมีปัญหาใน routing');
    }
    
  } catch (error) {
    console.error('Error testing POST:', error.message);
  }

  // ทดสอบ OPTIONS request (preflight)
  console.log('\n3. ทดสอบ OPTIONS request (CORS preflight)');
  
  try {
    const response = await makeRequest('OPTIONS', '/partner/day-off/1/approve');
    
    console.log('OPTIONS Response Status:', response.statusCode);
    console.log('OPTIONS Response Headers:', response.headers);
    
    if (response.headers['access-control-allow-methods']) {
      console.log('Allowed Methods:', response.headers['access-control-allow-methods']);
      
      if (response.headers['access-control-allow-methods'].includes('PATCH')) {
        console.log('✅ PATCH method รองรับใน CORS');
      } else {
        console.log('❌ PATCH method ไม่รองรับใน CORS');
      }
    }
    
  } catch (error) {
    console.error('Error testing OPTIONS:', error.message);
  }

  console.log('\n='.repeat(50));
  console.log('🏁 Test completed');
}

// เรียกใช้ฟังก์ชันทดสอบ
testPatchMethod().catch(console.error);
