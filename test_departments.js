const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3600,
  path: '/departments/facility',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJkZXZlbG9wZXIiLCJpYXQiOjE3NTY1NzkxMjYsImV4cCI6MTc2MDQ2NzEyNn0.NzqXKErKCed147yKZ-tpRtQY5UOkttwpnIKP2HLPK44'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    
    if (data) {
      try {
        const json = JSON.parse(data);
        console.log('\n=== DEPARTMENTS API RESPONSE ===');
        
        if (json.departments && json.departments.length > 0) {
          // ดูข้อมูลแผนกแรก
          const firstDept = json.departments[0];
          console.log('First Department:');
          console.log('  ID:', firstDept.id);
          console.log('  Name:', firstDept.name);
          
          // ตรวจสอบ department_supervisors
          if (firstDept.department_supervisors && firstDept.department_supervisors.length > 0) {
            console.log('\n=== DEPARTMENT SUPERVISORS ===');
            firstDept.department_supervisors.forEach((supervisor, index) => {
              console.log(`Supervisor ${index + 1}:`);
              console.log('  ID:', supervisor.id);
              console.log('  Role:', supervisor.role);
              console.log('  User Info:');
              if (supervisor.user) {
                console.log('    User ID:', supervisor.user.id);
                console.log('    Username:', supervisor.user.username);
                console.log('    First Name:', supervisor.user.first_name);
                console.log('    Last Name:', supervisor.user.last_name);
                console.log('    Email:', supervisor.user.email);
                console.log('    Phone:', supervisor.user.phone_number);
                console.log('    Has encrypted fields?', {
                  first_name_encrypted: !!supervisor.user.first_name_encrypted,
                  last_name_encrypted: !!supervisor.user.last_name_encrypted,
                  email_encrypted: !!supervisor.user.email_encrypted,
                  phone_number_encrypted: !!supervisor.user.phone_number_encrypted
                });
              } else {
                console.log('    No user data');
              }
              console.log('');
            });
          } else {
            console.log('\nNo department supervisors found');
          }
          
          // ตรวจสอบ department_members
          if (firstDept.department_members && firstDept.department_members.length > 0) {
            console.log('\n=== DEPARTMENT MEMBERS (First 2) ===');
            firstDept.department_members.slice(0, 2).forEach((member, index) => {
              console.log(`Member ${index + 1}:`);
              console.log('  Member ID:', member.id);
              if (member.user) {
                console.log('    User ID:', member.user.id);
                console.log('    Username:', member.user.username);
                console.log('    First Name:', member.user.first_name);
                console.log('    Last Name:', member.user.last_name);
                console.log('    Email:', member.user.email);
                console.log('    Phone:', member.user.phone_number);
                console.log('    Has encrypted fields?', {
                  first_name_encrypted: !!member.user.first_name_encrypted,
                  last_name_encrypted: !!member.user.last_name_encrypted,
                  email_encrypted: !!member.user.email_encrypted,
                  phone_number_encrypted: !!member.user.phone_number_encrypted
                });
              } else {
                console.log('    No user data');
              }
              console.log('');
            });
          } else {
            console.log('\nNo department members found');
          }
          
        } else {
          console.log('No departments found');
        }
      } catch (e) {
        console.error('Error parsing JSON:', e.message);
        console.log('Raw response:', data.substring(0, 500) + '...');
      }
    } else {
      console.log('No response data');
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.end();
