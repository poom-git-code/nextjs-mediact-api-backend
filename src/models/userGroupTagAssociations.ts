// เพิ่มใน associations.ts หรือสร้างไฟล์แยก
import UserGroupTagModel from "../models/UserGroupTagModel";
import UserGroupTagMemberModel from "../models/UserGroupTagMemberModel";
import DepartmentModel from "../models/DepartmentModel";
import UserModel from "../models/UserModel";
import { RoleModel } from "../models/RolesModel";

export const setupUserGroupTagAssociations = () => {
  // UserGroupTag associations
  UserGroupTagModel.belongsTo(DepartmentModel, {
    as: "department",
    foreignKey: "department_id",
  });

  DepartmentModel.hasMany(UserGroupTagModel, {
    as: "user_group_tags",
    foreignKey: "department_id",
  });

  // UserGroupTag role association
  UserGroupTagModel.belongsTo(RoleModel, {
    as: "role",
    foreignKey: "role_id",
  });

  RoleModel.hasMany(UserGroupTagModel, {
    as: "user_group_tags",
    foreignKey: "role_id",
  });

  UserGroupTagModel.belongsTo(UserModel, {
    as: "created_by_user",
    foreignKey: "created_by",
  });

  UserGroupTagModel.belongsTo(UserModel, {
    as: "updated_by_user",
    foreignKey: "updated_by",
  });

  // UserGroupTagMember associations
  UserGroupTagMemberModel.belongsTo(UserGroupTagModel, {
    as: "user_group_tag",
    foreignKey: "user_group_tag_id",
  });

  UserGroupTagModel.hasMany(UserGroupTagMemberModel, {
    as: "members",
    foreignKey: "user_group_tag_id",
  });

  UserGroupTagMemberModel.belongsTo(UserModel, {
    as: "user",
    foreignKey: "user_id",
  });

  UserModel.hasMany(UserGroupTagMemberModel, {
    as: "user_group_memberships",
    foreignKey: "user_id",
  });

  UserGroupTagMemberModel.belongsTo(UserModel, {
    as: "created_by_user",
    foreignKey: "created_by",
  });

  UserGroupTagMemberModel.belongsTo(UserModel, {
    as: "updated_by_user",
    foreignKey: "updated_by",
  });
};
