// Test department service with shift types relationships
const DepartmentService = require('./src/services/departmentService');

async function testDepartmentWithShiftTypes() {
  console.log('🧪 Testing Department Service with Shift Types Relationships...\n');
  
  try {
    // ทดสอบด้วย department ID ที่มีจริง
    const departmentId = 1; // เปลี่ยนเป็น ID ที่มีจริงในฐานข้อมูล
    
    console.log(`📋 Fetching department ${departmentId} with details...`);
    
    const department = await DepartmentService.getDepartmentByIdWithDetails(departmentId);
    
    console.log('✅ Department retrieved successfully!');
    console.log('Department name:', department.name);
    
    if (department.shift_types && department.shift_types.length > 0) {
      console.log(`\n📋 Found ${department.shift_types.length} shift types:`);
      
      department.shift_types.forEach((shiftType, index) => {
        console.log(`\n--- Shift Type ${index + 1} ---`);
        console.log('Name:', shiftType.name);
        console.log('Short Name:', shiftType.short_name);
        console.log('Color:', shiftType.color_code);
        
        // ตรวจสอบ roles
        if (shiftType.shift_type_roles && shiftType.shift_type_roles.length > 0) {
          console.log('Roles:');
          shiftType.shift_type_roles.forEach(roleRelation => {
            if (roleRelation.role) {
              console.log(`  - ${roleRelation.role.name} (ID: ${roleRelation.role.id})`);
            }
          });
        } else {
          console.log('Roles: None');
        }
        
        // ตรวจสอบ group tags
        if (shiftType.shift_type_group_tags && shiftType.shift_type_group_tags.length > 0) {
          console.log('Group Tags:');
          shiftType.shift_type_group_tags.forEach(groupTagRelation => {
            if (groupTagRelation.user_group_tag) {
              console.log(`  - ${groupTagRelation.user_group_tag.name} (ID: ${groupTagRelation.user_group_tag.id}) - Min: ${groupTagRelation.min_count}`);
            }
          });
        } else {
          console.log('Group Tags: None');
        }
        
        // ตรวจสอบ group_tag_requirements
        if (shiftType.group_tag_requirements && Object.keys(shiftType.group_tag_requirements).length > 0) {
          console.log('Group Tag Requirements:', JSON.stringify(shiftType.group_tag_requirements, null, 2));
        } else {
          console.log('Group Tag Requirements: None');
        }
      });
    } else {
      console.log('\n⚠️ No shift types found for this department');
    }
    
    // ทดสอบด้วย user ID สำหรับ getPartnerDepartmentByFacility
    console.log('\n' + '='.repeat(50));
    console.log('📋 Testing getPartnerDepartmentByFacility...');
    
    const userId = 1; // เปลี่ยนเป็น user ID ที่มีจริง
    
    const departments = await DepartmentService.getPartnerDepartmentByFacility(userId);
    
    console.log(`✅ Found ${departments.length} departments for user ${userId}`);
    
    if (departments.length > 0) {
      const firstDept = departments[0];
      console.log(`\nFirst department: ${firstDept.name}`);
      
      if (firstDept.shift_types && firstDept.shift_types.length > 0) {
        console.log(`Shift types count: ${firstDept.shift_types.length}`);
        const firstShiftType = firstDept.shift_types[0];
        console.log(`First shift type: ${firstShiftType.name}`);
        console.log('Has roles:', firstShiftType.shift_type_roles ? firstShiftType.shift_type_roles.length : 0);
        console.log('Has group tags:', firstShiftType.shift_type_group_tags ? firstShiftType.shift_type_group_tags.length : 0);
        console.log('Group tag requirements:', JSON.stringify(firstShiftType.group_tag_requirements || {}, null, 2));
      }
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('Stack trace:', error.stack);
  }
  
  console.log('\n🏁 Department Test Completed!');
}

// ถ้ารันไฟล์นี้โดยตรง
if (require.main === module) {
  testDepartmentWithShiftTypes().catch(console.error);
}

module.exports = { testDepartmentWithShiftTypes };
