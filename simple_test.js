// simple_test.js
// Simple test to check associations without using the service layer

const { setupAssociations } = require('./dist/models/associations');
const DepartmentModel = require('./dist/models/DepartmentModel').default;

async function testAssociations() {
  console.log('Setting up associations...');
  setupAssociations();
  
  console.log('Testing associations...');
  
  // Test if associations are set up
  const associations = DepartmentModel.associations;
  console.log('DepartmentModel associations:', Object.keys(associations));
  
  // Try to query with include
  try {
    const result = await DepartmentModel.findAll({
      limit: 1,
      include: [
        {
          model: require('./dist/models/DepartmentOperatingHoursModel').default,
          as: 'department_operating_hours',
          required: false,
        }
      ]
    });
    
    console.log('Query successful! Found', result.length, 'departments');
    if (result.length > 0) {
      console.log('Sample department:', result[0].name);
      console.log('Operating hours:', result[0].department_operating_hours?.length || 0);
    }
  } catch (error) {
    console.error('Query failed:', error.message);
  }
  
  process.exit(0);
}

testAssociations();
