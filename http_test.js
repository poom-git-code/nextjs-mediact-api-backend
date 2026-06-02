const http = require('http');

console.log('Testing connection to port 3602...');

const postData = JSON.stringify({
  identifier: 'H0110001',
  password: '11111111'
});

const options = {
  hostname: 'localhost',
  port: 3602,
  path: '/partner/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  },
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Body:', data);
  });
});

req.on('error', (error) => {
  console.error('Request Error:', error);
});

req.on('timeout', () => {
  console.error('Request Timeout');
  req.destroy();
});

req.write(postData);
req.end();
