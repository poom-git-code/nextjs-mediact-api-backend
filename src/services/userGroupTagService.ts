import UserGroupTagModel from "../models/UserGroupTagModel";
import { getUserAttributes, getBasicUserAttributes, getUserWithUsernameAttributes, decryptAndCleanUserData } from "../utils/encryptedFieldMapping";
import UserGroupTagMemberModel from "../models/UserGroupTagMemberModel";
import UserModel from "../models/UserModel";
import DepartmentModel from "../models/DepartmentModel";
import UserRoleModel from "../models/UserRolesModel";
import { RoleModel } from "../models/RolesModel";
import { PipedaUserDataHandler } from "../middleware/pipedaUserDataHandler";

export const createUserGroupTag = async (data: any, createdBy: number) => {
  // ตรวจสอบว่า role_id ถูกส่งมาหรือไม่
  if (!data.role_id) {
    throw new Error("Role ID is required for creating user group tag");
  }

  // ตรวจสอบว่า role นี้มีอยู่จริงหรือไม่
  const role = await RoleModel.findByPk(data.role_id);
  if (!role || !role.is_active) {
    throw new Error("Invalid or inactive role");
  }

  // ตรวจสอบว่า department นี้มีอยู่จริงหรือไม่
  const department = await DepartmentModel.findByPk(data.department_id);
  if (!department || !department.is_active) {
    throw new Error("Invalid or inactive department");
  }

  // ตรวจสอบว่าชื่อ group tag ซ้ำกันใน role และ department เดียวกันหรือไม่
  const existingGroupTag = await UserGroupTagModel.findOne({
    where: {
      name: data.name,
      role_id: data.role_id,
      department_id: data.department_id,
      is_active: true
    }
  });

  if (existingGroupTag) {
    throw new Error("Group tag with this name already exists for this role in this department");
  }

  const groupTagData = {
    name: data.name,
    description: data.description || null,
    department_id: data.department_id,
    role_id: data.role_id, // ตอนนี้เป็น required แล้ว
    color_code: data.color_code || null,
    is_active: data.is_active !== undefined ? data.is_active : true,
    created_by: createdBy,
    updated_by: createdBy,
  };

  return await UserGroupTagModel.create(groupTagData);
};

export const updateUserGroupTag = async (
  id: number,
  updates: Partial<UserGroupTagModel>,
  updatedBy: number
) => {
  const groupTag = await UserGroupTagModel.findByPk(id);
  if (!groupTag) {
    throw new Error("User group tag not found");
  }

  const updateData = {
    ...updates,
    updated_by: updatedBy,
  };

  return await groupTag.update(updateData);
};

export const deleteUserGroupTag = async (id: number) => {
  const groupTag = await UserGroupTagModel.findByPk(id);
  if (!groupTag) {
    throw new Error("User group tag not found");
  }
  return await groupTag.destroy();
};

export const getUserGroupTagById = async (id: number) => {
  const groupTag = await UserGroupTagModel.findByPk(id, {
    include: [
      {
        model: DepartmentModel,
        as: "department",
        attributes: ["id", "name"],
      },
      {
        model: RoleModel,
        as: "role",
        required: false,
        attributes: ["id", "name", "description"],
      },
      {
        model: UserGroupTagMemberModel,
        as: "members",
        required: false,
        where: { is_active: true },
        include: [
          {
            model: UserModel,
            as: "user",
            attributes: getUserAttributes(),
          },
        ],
      },
    ],
  });

  if (!groupTag) {
    throw new Error("User group tag not found");
  }

  // Process PIPEDA decryption for group tag members
  const groupTagData = groupTag.get({ plain: true });
  if (groupTagData.members && groupTagData.members.length > 0) {
    groupTagData.members.forEach((member: any) => {
      if (member.user) {
        member.user = decryptAndCleanUserData(member.user);
      }
    });
  }

  return groupTagData;
};

export const getUserGroupTagsByDepartment = async (departmentId: number) => {
  return await UserGroupTagModel.findAll({
    where: { 
      department_id: departmentId,
      is_active: true 
    },
    include: [
      {
        model: DepartmentModel,
        as: "department",
        attributes: ["id", "name"],
      },
      {
        model: RoleModel,
        as: "role",
        required: false,
        attributes: ["id", "name", "description"],
      },
      {
        model: UserGroupTagMemberModel,
        as: "members",
        required: false,
        where: { is_active: true },
        include: [
          {
            model: UserModel,
            as: "user",
            attributes: getUserAttributes(),
          },
        ],
      },
    ],
    order: [["seq", "ASC"], ["created_at", "DESC"]],
  });
};

export const getUserGroupTagsByRole = async (roleId: number, departmentId?: number) => {
  const whereConditions: any = {
    role_id: roleId,
    is_active: true
  };

  if (departmentId) {
    whereConditions.department_id = departmentId;
  }

  return await UserGroupTagModel.findAll({
    where: whereConditions,
    include: [
      {
        model: DepartmentModel,
        as: "department",
        attributes: ["id", "name"],
      },
      {
        model: RoleModel,
        as: "role",
        required: false,
        attributes: ["id", "name", "description"],
      },
      {
        model: UserGroupTagMemberModel,
        as: "members",
        required: false,
        where: { is_active: true },
        include: [
          {
            model: UserModel,
            as: "user",
            attributes: getUserAttributes(),
          },
        ],
      },
    ],
    order: [["seq", "ASC"], ["created_at", "DESC"]],
  });
};

export const getUserGroupTagsByDepartmentAndRole = async (departmentId: number, roleId?: number) => {
  const whereConditions: any = {
    department_id: departmentId,
    is_active: true
  };

  if (roleId) {
    whereConditions.role_id = roleId;
  }

  return await UserGroupTagModel.findAll({
    where: whereConditions,
    include: [
      {
        model: DepartmentModel,
        as: "department",
        attributes: ["id", "name"],
      },
      {
        model: RoleModel,
        as: "role",
        required: false,
        attributes: ["id", "name", "description"],
      },
      {
        model: UserGroupTagMemberModel,
        as: "members",
        required: false,
        where: { is_active: true },
        include: [
          {
            model: UserModel,
            as: "user",
            attributes: getUserAttributes(),
          },
        ],
      },
    ],
    order: [["role_id", "ASC"], ["seq", "ASC"], ["created_at", "DESC"]],
  });
};

export const addUserToGroupTag = async (
  groupTagId: number,
  userId: number,
  createdBy: number
) => {
  // ตรวจสอบว่า user อยู่ในกลุ่มแล้วหรือไม่
  const existingMember = await UserGroupTagMemberModel.findOne({
    where: {
      user_group_tag_id: groupTagId,
      user_id: userId,
    },
  });

  if (existingMember) {
    if (existingMember.is_active) {
      throw new Error("User is already a member of this group tag");
    } else {
      // ถ้าเคยเป็นสมาชิกแต่ถูก deactivate ให้ activate กลับ
      return await existingMember.update({
        is_active: true,
        updated_by: createdBy,
      });
    }
  }

  return await UserGroupTagMemberModel.create({
    user_group_tag_id: groupTagId,
    user_id: userId,
    is_active: true,
    created_by: createdBy,
    updated_by: createdBy,
  });
};

export const removeUserFromGroupTag = async (
  groupTagId: number,
  userId: number,
  updatedBy: number
) => {
  const member = await UserGroupTagMemberModel.findOne({
    where: {
      user_group_tag_id: groupTagId,
      user_id: userId,
      is_active: true,
    },
  });

  if (!member) {
    throw new Error("User is not a member of this group tag");
  }

  return await member.update({
    is_active: false,
    updated_by: updatedBy,
  });
};

export const getUserGroupTags = async (userId: number) => {
  // ดึง group tags ทั้งหมดที่ user เป็นสมาชิก
  return await UserGroupTagMemberModel.findAll({
    where: {
      user_id: userId,
      is_active: true
    },
    include: [
      {
        model: UserGroupTagModel,
        as: "user_group_tag",
        required: true,
        where: { is_active: true },
        include: [
          {
            model: DepartmentModel,
            as: "department",
            attributes: ["id", "name"],
          }
        ]
      }
    ],
    order: [["created_at", "DESC"]],
  });
};

export const addUserToMultipleGroupTags = async (
  userId: number,
  groupTagIds: number[],
  createdBy: number
) => {
  const results = [];
  
  for (const groupTagId of groupTagIds) {
    try {
      // ตรวจสอบว่า user อยู่ในกลุ่มแล้วหรือไม่
      const existingMember = await UserGroupTagMemberModel.findOne({
        where: {
          user_group_tag_id: groupTagId,
          user_id: userId,
        },
      });

      if (existingMember) {
        if (existingMember.is_active) {
          results.push({
            groupTagId,
            status: 'already_member',
            message: 'User is already a member of this group tag'
          });
        } else {
          // ถ้าเคยเป็นสมาชิกแต่ถูก deactivate ให้ activate กลับ
          const updated = await existingMember.update({
            is_active: true,
            updated_by: createdBy,
          });
          results.push({
            groupTagId,
            status: 'reactivated',
            data: updated
          });
        }
      } else {
        // สร้างสมาชิกใหม่
        const newMember = await UserGroupTagMemberModel.create({
          user_group_tag_id: groupTagId,
          user_id: userId,
          is_active: true,
          created_by: createdBy,
          updated_by: createdBy,
        });
        results.push({
          groupTagId,
          status: 'added',
          data: newMember
        });
      }
    } catch (error: any) {
      results.push({
        groupTagId,
        status: 'error',
        message: error.message
      });
    }
  }

  return results;
};

export const removeUserFromMultipleGroupTags = async (
  userId: number,
  groupTagIds: number[],
  updatedBy: number
) => {
  const results = [];

  for (const groupTagId of groupTagIds) {
    try {
      const member = await UserGroupTagMemberModel.findOne({
        where: {
          user_group_tag_id: groupTagId,
          user_id: userId,
          is_active: true,
        },
      });

      if (!member) {
        results.push({
          groupTagId,
          status: 'not_member',
          message: 'User is not a member of this group tag'
        });
      } else {
        const updated = await member.update({
          is_active: false,
          updated_by: updatedBy,
        });
        results.push({
          groupTagId,
          status: 'removed',
          data: updated
        });
      }
    } catch (error: any) {
      results.push({
        groupTagId,
        status: 'error',
        message: error.message
      });
    }
  }

  return results;
};

export const getUsersByGroupTag = async (groupTagId: number) => {
  // ดึง users ทั้งหมดที่อยู่ใน group tag นี้
  return await UserGroupTagMemberModel.findAll({
    where: {
      user_group_tag_id: groupTagId,
      is_active: true
    },
    include: [
      {
        model: UserModel,
        as: "user",
        required: true,
        attributes: getUserAttributes(),
        include: [
          {
            model: UserRoleModel,
            as: "user_role",
            required: false,
            attributes: ["id", "user_id", "role_id"],
            include: [
              {
                model: RoleModel,
                as: "role",
                required: false,
                attributes: ["id", "name", "description"]
              }
            ]
          }
        ]
      }
    ],
    order: [["created_at", "DESC"]],
  });
};

export const getUsersInDepartmentByGroupTags = async (departmentId: number) => {
  // ดึง users ในแผนกแยกตาม group tags
  const groupTags = await UserGroupTagModel.findAll({
    where: {
      department_id: departmentId,
      is_active: true
    },
    include: [
      {
        model: UserGroupTagMemberModel,
        as: "members",
        required: false,
        where: { is_active: true },
        include: [
          {
            model: UserModel,
            as: "user",
            required: true,
            attributes: getUserAttributes(),
            include: [
              {
                model: UserRoleModel,
                as: "user_role",
                required: false,
                attributes: ["id", "user_id", "role_id"],
                include: [
                  {
                    model: RoleModel,
                    as: "role",
                    required: false,
                    attributes: ["id", "name", "description"]
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    order: [["seq", "ASC"], ["created_at", "DESC"]],
  });

  return groupTags;
};

export const getAllUserGroupTags = async () => {
  return await UserGroupTagModel.findAll({
    where: { is_active: true },
    include: [
      {
        model: DepartmentModel,
        as: "department",
        attributes: ["id", "name"],
      },
      {
        model: RoleModel,
        as: "role",
        required: false,
        attributes: ["id", "name", "description"],
      },
    ],
    order: [["seq", "ASC"], ["created_at", "DESC"]],
  });
};

export const removeUserFromAllGroupTags = async (userId: number) => {
  // หา group tags ทั้งหมดที่ user เป็นสมาชิกอยู่
  const userGroupTagMembers = await UserGroupTagMemberModel.findAll({
    where: {
      user_id: userId,
      is_active: true,
    },
  });

  // อัปเดต is_active เป็น false สำหรับทุก membership
  if (userGroupTagMembers.length > 0) {
    await UserGroupTagMemberModel.update(
      { 
        is_active: false,
        updated_at: new Date(),
      },
      {
        where: {
          user_id: userId,
          is_active: true,
        },
      }
    );
  }

  return userGroupTagMembers.length;
};
