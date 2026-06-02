import UserModel from '../models/UserModel';
import ShiftTypeModel from '../models/ShiftTypesModel';
import UserEmploymentModel from '../models/UserEmploymentsModel';
import FacilityModel from '../models/FacilitiesModel';
import DepartmentModel from '../models/DepartmentModel';
import ScheduleShiftModel from '../models/ScheduleShiftsModel';
import ShiftTypeRoleModel from '../models/ShiftTypeRoleModel';
import ShiftTypeGroupTagModel from '../models/ShiftTypeGroupTagModel';
import { RoleModel } from '../models/RolesModel';
import UserGroupTagModel from '../models/UserGroupTagModel';
import UserGroupTagMemberModel from '../models/UserGroupTagMemberModel';
import { Sequelize, Op } from 'sequelize';

export const createShiftType = async (data: any, createdBy: number) => {
  const { 
    role_ids, 
    group_tag_ids, 
    group_tags, 
    allowed_roles, 
    group_tag_requirements,
    role_requirements,
    ...shiftTypeData 
  } = data;
  
  // แปลง group_tags เป็น numbers ถ้าจำเป็น
  const processedGroupTags = group_tags && Array.isArray(group_tags) 
    ? group_tags.map(tag => typeof tag === 'string' ? parseInt(tag, 10) : tag).filter(id => !isNaN(id) && id > 0)
    : [];

  // แปลง allowed_roles เป็น numbers ถ้าจำเป็น
  const processedAllowedRoles = allowed_roles && Array.isArray(allowed_roles)
    ? allowed_roles.map(role => typeof role === 'string' ? parseInt(role, 10) : role).filter(id => !isNaN(id) && id > 0)
    : [];

  // เตรียมข้อมูลสำหรับบันทึก
  const shiftTypePayload = {
    ...shiftTypeData,
    created_by: createdBy,
    updated_by: createdBy,
  };

  // สร้าง shift type ก่อน
  const shiftType = await ShiftTypeModel.create(shiftTypePayload);

  // เพิ่ม roles ถ้ามี (ใช้ role_ids หรือ allowed_roles)
  const rolesToAdd = role_ids || processedAllowedRoles;
  if (rolesToAdd && Array.isArray(rolesToAdd) && rolesToAdd.length > 0) {
    await addRolesToShiftType(shiftType.id, rolesToAdd, createdBy, role_requirements);
  }

  // เพิ่ม group tags ถ้ามี (ใช้ group_tag_ids หรือ group_tags)
  const groupTagsToAdd = group_tag_ids || processedGroupTags;
  if (groupTagsToAdd && Array.isArray(groupTagsToAdd) && groupTagsToAdd.length > 0) {
    await addGroupTagsToShiftType(shiftType.id, groupTagsToAdd, createdBy, group_tag_requirements);
  }

  return shiftType;
};

export const updateShiftType = async (id: number, updates: any, updatedBy: number) => {
  const { 
    role_ids, 
    group_tag_ids, 
    group_tags, 
    allowed_roles, 
    group_tag_requirements,
    role_requirements,
    ...shiftTypeUpdates 
  } = updates;
  
  const shiftType = await ShiftTypeModel.findByPk(id);
  if (!shiftType) {
    throw new Error('ShiftType not found');
  }

  // แปลง group_tags เป็น numbers ถ้าจำเป็น
  const processedGroupTags = group_tags && Array.isArray(group_tags) 
    ? group_tags.map(tag => typeof tag === 'string' ? parseInt(tag, 10) : tag).filter(id => !isNaN(id) && id > 0)
    : undefined;

  // แปลง allowed_roles เป็น numbers ถ้าจำเป็น
  const processedAllowedRoles = allowed_roles && Array.isArray(allowed_roles)
    ? allowed_roles.map(role => typeof role === 'string' ? parseInt(role, 10) : role).filter(id => !isNaN(id) && id > 0)
    : undefined;

  // สร้าง update payload โดยไม่รวม relationship fields
  const updatePayload = { ...shiftTypeUpdates, updated_by: updatedBy };

  // อัปเดตข้อมูล shift type หลัก
  await shiftType.update(updatePayload);

  // อัปเดต roles ถ้ามีการส่งมา
  // ให้ priority กับ role_ids ก่อน แล้วถึง allowed_roles
  let rolesToUpdate = undefined;
  if (role_ids !== undefined) {
    rolesToUpdate = role_ids;
  } else if (allowed_roles !== undefined) {
    rolesToUpdate = processedAllowedRoles;
  }
  
  if (rolesToUpdate !== undefined) {
    await updateShiftTypeRoles(id, rolesToUpdate, updatedBy, role_requirements);
  }

  // อัปเดต group tags ถ้ามีการส่งมา
  // ให้ priority กับ group_tag_ids ก่อน แล้วถึง group_tags
  let groupTagsToUpdate = undefined;
  if (group_tag_ids !== undefined) {
    groupTagsToUpdate = group_tag_ids;
  } else if (group_tags !== undefined) {
    groupTagsToUpdate = processedGroupTags;
  }
  
  if (groupTagsToUpdate !== undefined) {
    await updateShiftTypeGroupTags(id, groupTagsToUpdate, updatedBy, group_tag_requirements);
  }

  return shiftType;
};

export const deleteShiftType = async (id: number) => {
  const shiftType = await ShiftTypeModel.findByPk(id);
  if (!shiftType) {
    throw new Error('ShiftType not found');
  }
  return await shiftType.destroy();
};

export const getShiftTypeById = async (id: number) => {
  const shiftType = await ShiftTypeModel.findByPk(id);
  if (!shiftType) {
    throw new Error('ShiftType not found');
  }
  return shiftType;
};

// export const getShiftTypeById = async (id: number) => {
//   const shiftType = await ShiftTypeModel.findByPk(id);
//   if (!shiftType) {
//     throw new Error('ShiftType not found');
//   }
//   return shiftType;
// };

export const getShiftTypeByFacility = async (userId: number, department_id?: number) => {
  const userWithFacility = await UserModel.findOne({
    where: { id: userId },
    include: [
      {
        model: UserEmploymentModel,
        as: "user_employment",
        where: { is_active: true },
        required: false,
        include: [
          {
            model: FacilityModel,
            as: "facility",
            where: { is_active: true },
            required: false,
          },
        ],
      },
    ],
  });

  const user_employment = userWithFacility?.user_employment as
    | UserEmploymentModel[]
    | undefined;

  if (!user_employment || user_employment.length === 0) {
    throw new Error("User employment data not found or empty");
  }

  if (!user_employment || !user_employment[0].facility_id) {
    throw new Error("Facility ID not found for the user");
  }

  const facilityId = user_employment[0].facility_id;
  // console.log("facilityId: ", facilityId);

  const whereConditions: { facility_id: number; department_id?: number } = {
    facility_id: facilityId
  };

  if (department_id) {
    whereConditions.department_id = department_id;
  }

  const shiftTypes = await ShiftTypeModel.findAll({
    where: whereConditions,
    include: [
      {
        model: DepartmentModel,
        as: "department",
        // where: { is_active: true },
        required: false,
      },
    ],
  });

  if (!shiftTypes || shiftTypes.length === 0) {
    throw new Error("No shift type found for the given facility");
  }

  const scheduleShift = await ScheduleShiftModel.findOne({
    where: whereConditions,
    attributes: ["id"],
    raw: true,
  });

  const scheduleId = scheduleShift ? scheduleShift.id : null;

  return { shiftTypes, scheduleId };
};

export const getAllShiftTypes = async () => {
  return await ShiftTypeModel.findAll();
};

// ฟังก์ชันสำหรับจัดการ roles ของ shift type
// Type definition for role requirements
interface RoleRequirements {
  min_count?: number;
  max_count?: number;
  min_count_weekday?: number;
  max_count_weekday?: number;
  min_count_weekend?: number;
  max_count_weekend?: number;
}

export const addRolesToShiftType = async (
  shiftTypeId: number, 
  roleIds: number[], 
  createdBy: number, 
  roleRequirements?: { [key: string]: RoleRequirements }
) => {
  const roleData = roleIds.map(roleId => {
    const requirements = roleRequirements?.[roleId.toString()];
    
    return {
      shift_type_id: shiftTypeId,
      role_id: roleId,
      min_count: requirements?.min_count || null,
      max_count: requirements?.max_count || null,
      min_count_weekday: requirements?.min_count_weekday || null,
      max_count_weekday: requirements?.max_count_weekday || null,
      min_count_weekend: requirements?.min_count_weekend || null,
      max_count_weekend: requirements?.max_count_weekend || null,
      is_active: true,
      created_by: createdBy,
      updated_by: createdBy,
    };
  });

  return await ShiftTypeRoleModel.bulkCreate(roleData, {
    ignoreDuplicates: true, // ignore duplicates
  });
};

export const removeRolesFromShiftType = async (shiftTypeId: number, roleIds: number[], updatedBy: number) => {
  return await ShiftTypeRoleModel.update(
    { is_active: false, updated_by: updatedBy },
    {
      where: {
        shift_type_id: shiftTypeId,
        role_id: roleIds,
        is_active: true,
      },
    }
  );
};

export const updateShiftTypeRoles = async (
  shiftTypeId: number, 
  roleIds: number[], 
  updatedBy: number,
  roleRequirements?: { [key: string]: RoleRequirements }
) => {
  // ดึงข้อมูล roles ที่มีอยู่เดิม (ทั้ง active และ inactive)
  const existingRoles = await ShiftTypeRoleModel.findAll({
    where: {
      shift_type_id: shiftTypeId,
    },
  });
  
  console.log('All existing roles for shift type', shiftTypeId, ':', existingRoles.map(r => ({id: r.id, roleId: r.role_id, isActive: r.is_active})));

  // ปิดการใช้งาน roles ที่ไม่อยู่ใน roleIds ใหม่ (เฉพาะที่ active อยู่)
  const activeExistingRoleIds = existingRoles.filter(role => role.is_active).map(role => role.role_id);
  const rolesToDeactivate = activeExistingRoleIds.filter(roleId => !roleIds.includes(roleId));
  
  if (rolesToDeactivate.length > 0) {
    await ShiftTypeRoleModel.update(
      { is_active: false, updated_by: updatedBy },
      {
        where: {
          shift_type_id: shiftTypeId,
          role_id: rolesToDeactivate,
          is_active: true,
        },
      }
    );
  }

  // สำหรับ roles ใหม่และที่มีอยู่แล้ว ให้ upsert
  for (const roleId of roleIds) {
    const requirements = roleRequirements?.[roleId.toString()];
    const existingRole = existingRoles.find(role => role.role_id === roleId);
    
    console.log('Processing role', roleId, '- existingRole found:', !!existingRole);

    const roleData = {
      shift_type_id: shiftTypeId,
      role_id: roleId,
      min_count: requirements?.min_count || null,
      max_count: requirements?.max_count || null,
      min_count_weekday: requirements?.min_count_weekday || null,
      max_count_weekday: requirements?.max_count_weekday || null,
      min_count_weekend: requirements?.min_count_weekend || null,
      max_count_weekend: requirements?.max_count_weekend || null,
      is_active: true,
      created_by: existingRole?.created_by || updatedBy,
      updated_by: updatedBy,
    };

    if (existingRole) {
      // อัปเดตข้อมูลเดิม
      await existingRole.update({
        min_count: roleData.min_count,
        max_count: roleData.max_count,
        min_count_weekday: roleData.min_count_weekday,
        max_count_weekday: roleData.max_count_weekday,
        min_count_weekend: roleData.min_count_weekend,
        max_count_weekend: roleData.max_count_weekend,
        is_active: true,
        updated_by: updatedBy,
      });
    } else {
      // สร้างใหม่
      await ShiftTypeRoleModel.create(roleData);
    }
  }
};

// ฟังก์ชันสำหรับจัดการ group tags ของ shift type
export const addGroupTagsToShiftType = async (
  shiftTypeId: number, 
  groupTagIds: number[], 
  createdBy: number,
  groupTagRequirements?: { 
    [key: string]: { 
      min?: number; 
      min_count?: number;
      priority_level?: number;
      is_primary_group?: boolean;
    } 
  }
) => {
  const groupTagData = groupTagIds.map(groupTagId => {
    const requirements = groupTagRequirements && groupTagRequirements[groupTagId.toString()];
    // รองรับทั้ง min และ min_count (ให้ priority กับ min)
    const minCount = requirements?.min || requirements?.min_count || 0;
    const priorityLevel = requirements?.priority_level || 1;
    const isPrimaryGroup = requirements?.is_primary_group || false;
    
    return {
      shift_type_id: shiftTypeId,
      user_group_tag_id: groupTagId,
      min_count: minCount > 0 ? minCount : 0,
      priority_level: priorityLevel,
      is_primary_group: isPrimaryGroup,
      is_active: true,
      created_by: createdBy,
      updated_by: createdBy,
    };
  });

  return await ShiftTypeGroupTagModel.bulkCreate(groupTagData, {
    ignoreDuplicates: true, // ignore duplicates
  });
};

export const removeGroupTagsFromShiftType = async (shiftTypeId: number, groupTagIds: number[], updatedBy: number) => {
  return await ShiftTypeGroupTagModel.update(
    { is_active: false, updated_by: updatedBy },
    {
      where: {
        shift_type_id: shiftTypeId,
        user_group_tag_id: groupTagIds,
        is_active: true,
      },
    }
  );
};

export const updateShiftTypeGroupTags = async (
  shiftTypeId: number, 
  groupTagIds: number[], 
  updatedBy: number,
  groupTagRequirements?: { 
    [key: string]: { 
      min?: number; 
      min_count?: number;
      priority_level?: number;
      is_primary_group?: boolean;
    } 
  }
) => {
  // ดึงข้อมูล group tags ที่มีอยู่เดิม
  const existingGroupTags = await ShiftTypeGroupTagModel.findAll({
    where: {
      shift_type_id: shiftTypeId,
      is_active: true,
    },
  });

  // ปิดการใช้งาน group tags ที่ไม่อยู่ใน groupTagIds ใหม่
  const existingGroupTagIds = existingGroupTags.map(groupTag => groupTag.user_group_tag_id);
  const groupTagsToDeactivate = existingGroupTagIds.filter(groupTagId => !groupTagIds.includes(groupTagId));
  
  if (groupTagsToDeactivate.length > 0) {
    await ShiftTypeGroupTagModel.update(
      { is_active: false, updated_by: updatedBy },
      {
        where: {
          shift_type_id: shiftTypeId,
          user_group_tag_id: groupTagsToDeactivate,
          is_active: true,
        },
      }
    );
  }

  // สำหรับ group tags ใหม่และที่มีอยู่แล้ว ให้ upsert
  for (const groupTagId of groupTagIds) {
    const requirements = groupTagRequirements?.[groupTagId.toString()];
    const minCount = requirements?.min || requirements?.min_count || 0;
    const priorityLevel = requirements?.priority_level || 1;
    const isPrimaryGroup = requirements?.is_primary_group || false;
    const existingGroupTag = existingGroupTags.find(groupTag => groupTag.user_group_tag_id === groupTagId);

    const groupTagData = {
      shift_type_id: shiftTypeId,
      user_group_tag_id: groupTagId,
      min_count: minCount > 0 ? minCount : 0,
      priority_level: priorityLevel,
      is_primary_group: isPrimaryGroup,
      is_active: true,
      created_by: existingGroupTag?.created_by || updatedBy,
      updated_by: updatedBy,
    };

    if (existingGroupTag) {
      // อัปเดตข้อมูลเดิม
      await existingGroupTag.update({
        min_count: groupTagData.min_count,
        priority_level: groupTagData.priority_level,
        is_primary_group: groupTagData.is_primary_group,
        is_active: true,
        updated_by: updatedBy,
      });
    } else {
      // สร้างใหม่
      await ShiftTypeGroupTagModel.create(groupTagData);
    }
  }
};

// ฟังก์ชันดึงข้อมูล shift type พร้อม roles และ group tags
export const getShiftTypeWithRelations = async (id: number) => {
  const shiftType = await ShiftTypeModel.findByPk(id, {
    include: [
      {
        model: DepartmentModel,
        as: "department",
        required: false,
      },
      {
        model: ShiftTypeRoleModel,
        as: "shift_type_roles",
        required: false,
        where: { is_active: true },
        attributes: ["id", "shift_type_id", "role_id", "min_count", "max_count", "is_active"],
        include: [
          {
            model: RoleModel,
            as: "role",
            required: false,
            attributes: ["id", "name", "description"],
          },
        ],
      },
      {
        model: ShiftTypeGroupTagModel,
        as: "shift_type_group_tags",
        required: false,
        where: { is_active: true },
        attributes: [
          "id", 
          "shift_type_id", 
          "user_group_tag_id", 
          "min_count", 
          "priority_level",
          "is_primary_group", 
          "is_active"
        ],
        include: [
          {
            model: UserGroupTagModel,
            as: "user_group_tag",
            required: false,
            where: { 
              is_active: true 
            },
            attributes: ["id", "name", "description", "color_code", "department_id"],
          },
        ],
      },
    ],
  });

  if (!shiftType) {
    throw new Error('ShiftType not found');
  }

  // แปลงข้อมูล group_tag_requirements จาก relationship table
  const shiftTypeData = shiftType.toJSON();
  
  // กรอง group tags ให้เฉพาะ department เดียวกับ shift type
  if (shiftTypeData.shift_type_group_tags && shiftTypeData.shift_type_group_tags.length > 0) {
    shiftTypeData.shift_type_group_tags = shiftTypeData.shift_type_group_tags.filter((relation: any) => {
      return relation.user_group_tag && 
             relation.user_group_tag.department_id === shiftTypeData.department_id;
    });
  }
  
  // จัดการ group_tag_requirements
  if (shiftTypeData.shift_type_group_tags && shiftTypeData.shift_type_group_tags.length > 0) {
    const groupTagRequirements: { [key: string]: { min?: number } } = {};
    
    shiftTypeData.shift_type_group_tags.forEach((relation: any) => {
      if (relation.user_group_tag_id && relation.min_count > 0) {
        // เฉพาะเมื่อมีการจำกัดจริงๆ (min_count > 0) ถึงจะเพิ่มเข้าไป
        groupTagRequirements[relation.user_group_tag_id.toString()] = {
          min: relation.min_count,
        };
      }
    });
    
    // ถ้าไม่มีข้อจำกัดอะไรเลย ให้เป็น object ว่าง
    shiftTypeData.group_tag_requirements = groupTagRequirements;
  }

  // จัดการ role_requirements
  if (shiftTypeData.shift_type_roles && shiftTypeData.shift_type_roles.length > 0) {
    const roleRequirements: { [key: string]: RoleRequirements } = {};
    
    shiftTypeData.shift_type_roles.forEach((relation: any) => {
      if (relation.role_id && (relation.min_count > 0 || relation.max_count > 0 || 
          relation.min_count_weekday > 0 || relation.max_count_weekday > 0 ||
          relation.min_count_weekend > 0 || relation.max_count_weekend > 0)) {
        const requirements: RoleRequirements = {};
        
        if (relation.min_count && relation.min_count > 0) {
          requirements.min_count = relation.min_count;
        }
        if (relation.max_count && relation.max_count > 0) {
          requirements.max_count = relation.max_count;
        }
        if (relation.min_count_weekday && relation.min_count_weekday > 0) {
          requirements.min_count_weekday = relation.min_count_weekday;
        }
        if (relation.max_count_weekday && relation.max_count_weekday > 0) {
          requirements.max_count_weekday = relation.max_count_weekday;
        }
        if (relation.min_count_weekend && relation.min_count_weekend > 0) {
          requirements.min_count_weekend = relation.min_count_weekend;
        }
        if (relation.max_count_weekend && relation.max_count_weekend > 0) {
          requirements.max_count_weekend = relation.max_count_weekend;
        }
        
        // เฉพาะเมื่อมีการจำกัดจริงๆ ถึงจะเพิ่มเข้าไป
        if (Object.keys(requirements).length > 0) {
          roleRequirements[relation.role_id.toString()] = requirements;
        }
      }
    });
    
    shiftTypeData.role_requirements = roleRequirements;
  }

  return shiftTypeData;
};

// ===============================
// PRIORITY MANAGEMENT FUNCTIONS
// ===============================

/**
 * อัปเดต Priority และ Primary Group setting สำหรับ Group ใน Shift Type
 */
export const updateGroupPriority = async (
  shiftTypeId: number,
  groupTagId: number,
  priorityLevel: number,
  isPrimary: boolean = false,
  updatedBy?: number
) => {
  const updated = await ShiftTypeGroupTagModel.update(
    {
      priority_level: priorityLevel,
      is_primary_group: isPrimary,
      updated_by: updatedBy,
    },
    {
      where: {
        shift_type_id: shiftTypeId,
        user_group_tag_id: groupTagId,
      },
    }
  );

  return updated[0] > 0; // return true if updated
};

/**
 * ดึงรายการ Primary Groups สำหรับ Shift Type
 */
export const getPrimaryGroupsForShiftType = async (shiftTypeId: number) => {
  return await ShiftTypeGroupTagModel.findAll({
    where: {
      shift_type_id: shiftTypeId,
      is_primary_group: true,
      is_active: true,
    },
    include: [
      {
        model: UserGroupTagModel,
        attributes: ['id', 'name', 'description', 'color_code'],
      },
    ],
    order: [['priority_level', 'ASC']],
  });
};

/**
 * ดึงรายการทุก Groups พร้อม Priority สำหรับ Shift Type
 */
export const getShiftTypeGroupsWithPriority = async (shiftTypeId: number) => {
  return await ShiftTypeGroupTagModel.findAll({
    where: {
      shift_type_id: shiftTypeId,
      is_active: true,
    },
    include: [
      {
        model: UserGroupTagModel,
        attributes: ['id', 'name', 'description', 'color_code'],
      },
    ],
    order: [
      ['is_primary_group', 'DESC'],
      ['priority_level', 'ASC'],
    ],
  });
};

/**
 * จัดเวรตาม Priority Logic
 */
export const assignShiftWithPriority = async (request: {
  shiftTypeId: number;
  date: string;
  requiredRoles: {
    roleId: number;
    minCount: number;
    maxCount?: number;
  }[];
}) => {
  const { shiftTypeId, date, requiredRoles } = request;
  const assignedUsers: {
    userId: number;
    roleId: number;
    groupTagId: number;
    priorityLevel: number;
    isPrimary: boolean;
  }[] = [];
  const unfilledPositions: {
    roleId: number;
    remainingCount: number;
  }[] = [];

  // 1. ดึงข้อมูล Group Tags เรียงตาม Priority
  const shiftGroupTags = await ShiftTypeGroupTagModel.findAll({
    where: {
      shift_type_id: shiftTypeId,
      is_active: true,
    },
    include: [
      {
        model: UserGroupTagModel,
        attributes: ['id', 'name'],
      },
    ],
    order: [
      ['is_primary_group', 'DESC'], // Primary group ก่อน
      ['priority_level', 'ASC'],    // Priority สูงก่อน (1 = สูงสุด)
      ['min_count', 'DESC'],        // Group ที่ต้องการคนมากก่อน
    ],
  });

  // 2. สำหรับแต่ละ Role ที่ต้องการ
  for (const requiredRole of requiredRoles) {
    let remainingCount = requiredRole.minCount;

    // 3. วนลูปตาม Priority ของ Group
    for (const groupTag of shiftGroupTags) {
      if (remainingCount <= 0) break;

      // 4. ดึงสมาชิกที่ available ในกลุ่ม
      const availableMembers = await getAvailableGroupMembers(
        groupTag.user_group_tag_id,
        requiredRole.roleId,
        date,
        assignedUsers.map((u) => u.userId)
      );

      // 5. จัดเวรตาม logic
      if (groupTag.is_primary_group && groupTag.min_count > 0) {
        // Primary Group - จัดตาม min_count
        const primaryAssignCount = Math.min(
          remainingCount,
          groupTag.min_count,
          availableMembers.length
        );

        for (let i = 0; i < primaryAssignCount; i++) {
          assignedUsers.push({
            userId: availableMembers[i].id,
            roleId: requiredRole.roleId,
            groupTagId: groupTag.user_group_tag_id,
            priorityLevel: groupTag.priority_level,
            isPrimary: true,
          });
          remainingCount--;
        }
      } else {
        // Secondary Groups - กระจายเท่าๆ กัน
        const secondaryAssignCount = Math.min(
          remainingCount,
          availableMembers.length
        );

        for (let i = 0; i < secondaryAssignCount; i++) {
          assignedUsers.push({
            userId: availableMembers[i].id,
            roleId: requiredRole.roleId,
            groupTagId: groupTag.user_group_tag_id,
            priorityLevel: groupTag.priority_level,
            isPrimary: false,
          });
          remainingCount--;
        }
      }
    }

    // 6. ถ้ายังขาดคน บันทึกไว้
    if (remainingCount > 0) {
      unfilledPositions.push({
        roleId: requiredRole.roleId,
        remainingCount,
      });
    }
  }

  return {
    assignedUsers,
    unfilledPositions,
  };
};

/**
 * ดึงสมาชิกที่ available ในกลุ่มสำหรับ Role นั้นๆ
 */
const getAvailableGroupMembers = async (
  groupTagId: number,
  roleId: number,
  date: string,
  excludeUserIds: number[] = []
) => {
  return await UserModel.findAll({
    include: [
      {
        model: UserGroupTagMemberModel,
        where: {
          user_group_tag_id: groupTagId,
          is_active: true,
        },
        required: true,
      },
    ],
    where: {
      role_id: roleId,
      status_id: 1, // Active users only
      id: {
        [Op.notIn]: excludeUserIds,
      },
      // TODO: เพิ่มเงื่อนไขอื่นๆ เช่น
      // - ไม่ลาในวันนี้
      // - ไม่ได้เวรอื่นในวันนี้แล้ว
      // - ไม่เกินจำนวนชั่วโมงทำงาน
    },
    order: [
      // TODO: เพิ่ม logic การเรียงลำดับ เช่น
      // - วันที่ได้เวรครั้งล่าสุด (fair rotation)
      // - จำนวนชั่วโมงทำงานสะสม
      // - ความต้องการของคน
      ['created_at', 'ASC'], // ใช้ FIFO ก่อน
    ],
  });
};

//=== Mobile ===

//--- Productivity Record ---
export const getShiftTypesByDepartmentAndShiftDate = async (departmentId: number, shiftDate: string) => {
  try {
    
    const scheduleShifts = await ScheduleShiftModel.findAll({
      where: {
        department_id: departmentId,
        shift_date: shiftDate,
        is_active: true
      },
      include: [
        {
          model: ShiftTypeModel,
          as: 'shift_type',
          required: true,
          attributes: ['id', 'name', 'start_time', 'end_time', 'total_hours', 'color_code']
        }
      ],
      attributes: ['shift_type_id']
    });

    if (!scheduleShifts || scheduleShifts.length === 0) {
      return [];
    }

    
    const uniqueShiftTypes = new Map();
    
    scheduleShifts.forEach(shift => {
      const shiftType = (shift as any).shift_type;
      if (shiftType && !uniqueShiftTypes.has(shiftType.id)) {
        const shiftTypeName = shiftType.name || '';
        
        // filter "อบรม", "Vacation", "Day off"
        const excludeKeywords = ['อบรม', 'vacation', 'day off', 'Vacation', 'Day Off', 'DAY OFF'];
        const shouldExclude = excludeKeywords.some(keyword => 
          shiftTypeName.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (!shouldExclude) {
          uniqueShiftTypes.set(shiftType.id, shiftType);
        }
      }
    });

    return Array.from(uniqueShiftTypes.values());
    
  } catch (error) {
    console.error('Error in getShiftTypesByDepartmentAndShiftDate:', error);
    throw new Error(`Failed to get shift types: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}