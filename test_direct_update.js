// ทดสอบ updateShiftType function โดยตรง
const { createShiftType, updateShiftType, getShiftTypeWithRelations } = require('./src/services/shiftTypeService');

const testDirectUpdate = async () => {
  console.log('🔍 Testing updateShiftType function directly');
  
  try {
    // ข้อมูลสำหรับสร้าง shift type
    const createData = {
      "name": "Direct Test",
      "start_time": "08:00:00",
      "end_time": "17:00:00",
      "roles_allowed": "Staff",
      "short_name": "DT",
      "color_code": "#FFD1DC",
      "total_hours": 9,
      "normal_hours": 9,
      "ot_hours": 0,
      "count_as_fte": true,
      "count_as_working_hour": true,
      "is_active": true,
      "department_id": 82,
      "facility_id": 30,
      "allowed_roles": [5],
      "role_requirements": {
        "5": {"min_count": 1, "max_count": 3}
      }
    };

    console.log('\n📝 Step 1: Creating shift type...');
    const createdShiftType = await createShiftType(createData, 1);
    console.log(`✅ Created shift type ID: ${createdShiftType.id}`);

    // ดูข้อมูลหลังสร้าง
    console.log('\n🔍 Step 2: Getting created data with relations...');
    const createdWithRelations = await getShiftTypeWithRelations(createdShiftType.id);
    console.log('Created role requirements:', JSON.stringify(createdWithRelations.role_requirements || {}, null, 2));

    // ทดสอบ update
    const updateData = {
      "name": "M1 Updated Direct",
      "short_name": "M1UD",
      "color_code": "#B5E7A0",
      "count_as_fte": false,
      "allowed_roles": [5],
      "role_requirements": {
        "5": {"min_count": 2, "max_count": 6}
      }
    };

    console.log('\n📝 Step 3: Updating shift type...');
    console.log('Update data:', JSON.stringify(updateData, null, 2));
    
    const updatedShiftType = await updateShiftType(createdShiftType.id, updateData, 1);
    console.log('✅ Update completed');

    // ดูข้อมูลหลัง update
    console.log('\n🔍 Step 4: Getting updated data with relations...');
    const updatedWithRelations = await getShiftTypeWithRelations(createdShiftType.id);
    
    console.log('\n📊 Final Results:');
    console.log(`Name: ${updatedWithRelations.name}`);
    console.log(`Short Name: ${updatedWithRelations.short_name}`);
    console.log(`Color: ${updatedWithRelations.color_code}`);
    console.log(`Count as FTE: ${updatedWithRelations.count_as_fte}`);
    
    console.log('\n📊 Updated Role Requirements:');
    console.log(JSON.stringify(updatedWithRelations.role_requirements || {}, null, 2));
    
    console.log('\n📊 Raw Shift Type Roles:');
    if (updatedWithRelations.shift_type_roles) {
      updatedWithRelations.shift_type_roles.forEach(role => {
        console.log(`- Role ID: ${role.role_id}, Min: ${role.min_count}, Max: ${role.max_count}, Active: ${role.is_active}`);
      });
    } else {
      console.log('No shift_type_roles found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
};

testDirectUpdate();
