// เพิ่มใน associations.ts หรือสร้างไฟล์แยก
import ShiftTypeModel from "../models/ShiftTypesModel";
import ShiftTypeRoleModel from "../models/ShiftTypeRoleModel";
import ShiftTypeGroupTagModel from "../models/ShiftTypeGroupTagModel";
import { RoleModel } from "../models/RolesModel";
import UserGroupTagModel from "../models/UserGroupTagModel";

export const setupShiftTypeAssociations = () => {
  // ShiftType-Role associations
  ShiftTypeModel.hasMany(ShiftTypeRoleModel, {
    as: "shift_type_roles",
    foreignKey: "shift_type_id",
  });

  ShiftTypeRoleModel.belongsTo(ShiftTypeModel, {
    as: "shift_type",
    foreignKey: "shift_type_id",
  });

  ShiftTypeRoleModel.belongsTo(RoleModel, {
    as: "role",
    foreignKey: "role_id",
  });

  RoleModel.hasMany(ShiftTypeRoleModel, {
    as: "shift_type_roles",
    foreignKey: "role_id",
  });

  // ShiftType-GroupTag associations
  ShiftTypeModel.hasMany(ShiftTypeGroupTagModel, {
    as: "shift_type_group_tags",
    foreignKey: "shift_type_id",
  });

  ShiftTypeGroupTagModel.belongsTo(ShiftTypeModel, {
    as: "shift_type",
    foreignKey: "shift_type_id",
  });

  ShiftTypeGroupTagModel.belongsTo(UserGroupTagModel, {
    as: "user_group_tag",
    foreignKey: "user_group_tag_id",
  });

  UserGroupTagModel.hasMany(ShiftTypeGroupTagModel, {
    as: "shift_type_group_tags",
    foreignKey: "user_group_tag_id",
  });
};
