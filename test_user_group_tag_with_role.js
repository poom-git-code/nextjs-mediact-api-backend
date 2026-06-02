// Test user group tag with role functionality
const UserGroupTagService = require('./src/services/userGroupTagService');

async function testUserGroupTagWithRole() {
  console.log('🧪 Testing User Group Tag with Role...\n');
  
  try {
    // ทดสอบสร้าง group tag ที่มี role
    const testGroupTagData = {
      name: "Senior Nurses",
      description: "Senior level nursing staff",
      department_id: 1, // ใช้ department_id ที่มีจริง
      role_id: 2, // ใช้ role_id ที่มีจริง (เช่น Nurse role)
      color_code: "#4CAF50",
      is_active: true
    };
    
    console.log('📋 Creating group tag with role...');
    console.log('Input data:', JSON.stringify(testGroupTagData, null, 2));
    
    const createdGroupTag = await UserGroupTagService.createUserGroupTag(testGroupTagData, 1);
    console.log('✅ Group tag created:', createdGroupTag.toJSON());
    
    const groupTagId = createdGroupTag.id;
    
    // ทดสอบดึงข้อมูล group tag พร้อม role
    console.log('\n📋 Retrieving group tag with role details...');
    const groupTagWithRole = await UserGroupTagService.getUserGroupTagById(groupTagId);
    console.log('✅ Retrieved group tag:', JSON.stringify(groupTagWithRole.toJSON(), null, 2));
    
    // ตรวจสอบว่ามีข้อมูล role หรือไม่
    if (groupTagWithRole.role) {
      console.log('\n✅ Role information found:');
      console.log(`- Role ID: ${groupTagWithRole.role.id}`);
      console.log(`- Role Name: ${groupTagWithRole.role.name}`);
      console.log(`- Role Description: ${groupTagWithRole.role.description}`);
    } else {
      console.log('\n⚠️ No role information found (role_id might be null)');
    }
    
    // ทดสอบอัปเดต role_id
    console.log('\n📋 Testing role update...');
    const updateData = {
      role_id: 3 // เปลี่ยนเป็น role อื่น
    };
    
    const updatedGroupTag = await UserGroupTagService.updateUserGroupTag(groupTagId, updateData, 1);
    console.log('✅ Group tag updated with new role:', updatedGroupTag.toJSON());
    
    // ทดสอบดึงข้อมูล group tags ทั้งหมดในแผนก
    console.log('\n📋 Testing get group tags by department...');
    const departmentGroupTags = await UserGroupTagService.getUserGroupTagsByDepartment(1);
    console.log(`✅ Found ${departmentGroupTags.length} group tags in department`);
    
    if (departmentGroupTags.length > 0) {
      console.log('\nFirst group tag details:');
      const firstGroupTag = departmentGroupTags[0];
      console.log(`- Name: ${firstGroupTag.name}`);
      console.log(`- Department: ${firstGroupTag.department ? firstGroupTag.department.name : 'N/A'}`);
      console.log(`- Role: ${firstGroupTag.role ? firstGroupTag.role.name : 'No role assigned'}`);
    }
    
    // ทดสอบ set role_id เป็น null
    console.log('\n📋 Testing remove role assignment...');
    const removeRoleData = {
      role_id: null
    };
    
    const groupTagWithoutRole = await UserGroupTagService.updateUserGroupTag(groupTagId, removeRoleData, 1);
    console.log('✅ Role removed from group tag');
    
    const finalCheck = await UserGroupTagService.getUserGroupTagById(groupTagId);
    console.log(`Final role status: ${finalCheck.role ? finalCheck.role.name : 'No role assigned'}`);
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('Stack trace:', error.stack);
  }
  
  console.log('\n🏁 User Group Tag with Role Test Completed!');
}

// ถ้ารันไฟล์นี้โดยตรง
if (require.main === module) {
  testUserGroupTagWithRole().catch(console.error);
}

module.exports = { testUserGroupTagWithRole };
