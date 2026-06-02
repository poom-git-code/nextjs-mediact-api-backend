const axios = require('axios');

async function testFacilitiesAPI() {
    try {
        const response = await axios.get('http://localhost:3600/facilities', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJkZXZlbG9wZXIiLCJpYXQiOjE3NTY1NzkxMjYsImV4cCI6MTc2MDQ2NzEyNn0.NzqXKErKCed147yKZ-tpRtQY5UOkttwpnIKP2HLPK44'
            }
        });

        console.log('Status:', response.status);
        
        if (response.data && response.data.length > 0) {
            const facility = response.data[0];
            console.log('\nFirst Facility:');
            console.log('ID:', facility.id);
            console.log('Name:', facility.name);
            console.log('Address:', facility.address);
            
            console.log('\nCreated by user:');
            if (facility.created_by_user) {
                console.log('  ID:', facility.created_by_user.id);
                console.log('  Email:', facility.created_by_user.email);
                console.log('  First Name:', facility.created_by_user.first_name);
                console.log('  Last Name:', facility.created_by_user.last_name);
                console.log('  Phone:', facility.created_by_user.phone);
            } else {
                console.log('  No created_by_user data');
            }

            console.log('\nUpdated by user:');
            if (facility.updated_by_user) {
                console.log('  ID:', facility.updated_by_user.id);
                console.log('  Email:', facility.updated_by_user.email);
                console.log('  First Name:', facility.updated_by_user.first_name);
                console.log('  Last Name:', facility.updated_by_user.last_name);
                console.log('  Phone:', facility.updated_by_user.phone);
            } else {
                console.log('  No updated_by_user data');
            }

            console.log('\n=== RAW DATA CHECK ===');
            console.log('Created by user raw:', JSON.stringify(facility.created_by_user, null, 2));
        } else {
            console.log('No facilities data');
        }

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testFacilitiesAPI();
