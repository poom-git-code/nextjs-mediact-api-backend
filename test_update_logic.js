// Simple test เพื่อตรวจสอบ logic ของ updateShiftType
const testUpdateLogic = () => {
  console.log('🔍 Testing updateShiftType logic');
  
  // จำลอง input ที่ส่งมา
  const updates = {
    "name": "M1",
    "start_time": "08:00:00",
    "end_time": "17:00:00",
    "roles_allowed": "Staff",
    "short_name": "M1",
    "color_code": "#B5E7A0",
    "total_hours": 9,
    "normal_hours": 9,
    "ot_hours": 0,
    "count_as_fte": false,
    "count_as_working_hour": true,
    "min_staff_weekday": 1,
    "max_staff_weekday": 1,
    "min_staff_weekend": 1,
    "max_staff_weekend": 1,
    "required_senior_count": 1,
    "is_active": true,
    "department_id": 82,
    "facility_id": 30,
    "group_tags": [9, 10],
    "allowed_roles": [5],
    "group_tag_requirements": {
      "9": {"min_count": 1},
      "10": {"min_count": 1}
    },
    "role_requirements": {
      "5": {"min_count": 1, "max_count": 5}
    }
  };

  console.log('\n📝 Original updates object:');
  console.log(JSON.stringify(updates, null, 2));

  // จำลอง destructuring ที่ทำใน updateShiftType
  const { 
    role_ids, 
    group_tag_ids, 
    group_tags, 
    allowed_roles, 
    group_tag_requirements,
    role_requirements,
    ...shiftTypeUpdates 
  } = updates;

  console.log('\n📊 Extracted values:');
  console.log('role_ids:', role_ids);
  console.log('group_tag_ids:', group_tag_ids);
  console.log('group_tags:', group_tags);
  console.log('allowed_roles:', allowed_roles);
  console.log('group_tag_requirements:', group_tag_requirements);
  console.log('role_requirements:', role_requirements);

  console.log('\n📊 shiftTypeUpdates (for main table):');
  console.log(JSON.stringify(shiftTypeUpdates, null, 2));

  // จำลอง logic การแปลง
  const processedGroupTags = group_tags && Array.isArray(group_tags) 
    ? group_tags.map(tag => typeof tag === 'string' ? parseInt(tag, 10) : tag).filter(id => !isNaN(id) && id > 0)
    : undefined;

  const processedAllowedRoles = allowed_roles && Array.isArray(allowed_roles)
    ? allowed_roles.map(role => typeof role === 'string' ? parseInt(role, 10) : role).filter(id => !isNaN(id) && id > 0)
    : undefined;

  console.log('\n📊 Processed values:');
  console.log('processedGroupTags:', processedGroupTags);
  console.log('processedAllowedRoles:', processedAllowedRoles);

  // จำลอง logic การตัดสินใจ update
  let rolesToUpdate = undefined;
  if (role_ids !== undefined) {
    rolesToUpdate = role_ids;
  } else if (allowed_roles !== undefined) {
    rolesToUpdate = processedAllowedRoles;
  }
  
  let groupTagsToUpdate = undefined;
  if (group_tag_ids !== undefined) {
    groupTagsToUpdate = group_tag_ids;
  } else if (group_tags !== undefined) {
    groupTagsToUpdate = processedGroupTags;
  }

  console.log('\n📊 Final update decisions:');
  console.log('rolesToUpdate:', rolesToUpdate);
  console.log('groupTagsToUpdate:', groupTagsToUpdate);
  console.log('Will update roles?', rolesToUpdate !== undefined);
  console.log('Will update group tags?', groupTagsToUpdate !== undefined);

  if (rolesToUpdate !== undefined) {
    console.log('\n🔄 Would call updateShiftTypeRoles with:');
    console.log('- roleIds:', rolesToUpdate);
    console.log('- roleRequirements:', role_requirements);
  }

  if (groupTagsToUpdate !== undefined) {
    console.log('\n🔄 Would call updateShiftTypeGroupTags with:');
    console.log('- groupTagIds:', groupTagsToUpdate);
    console.log('- groupTagRequirements:', group_tag_requirements);
  }
};

testUpdateLogic();
