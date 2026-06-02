import RoleModel from "../models/RolesModel";

export const createRole = async (
  data: Partial<RoleModel>,
  createdBy: number
) => {
  return await RoleModel.create({
    ...data,
    created_by: createdBy,
    updated_by: createdBy,
  });
};

export const updateRole = async (
  id: number,
  updates: Partial<RoleModel>,
  updatedBy: number
) => {
  const role = await RoleModel.findByPk(id);
  if (!role) {
    throw new Error("Role not found");
  }
  return await role.update({
    ...updates,
    updated_by: updatedBy,
  });
};

export const deleteRole = async (id: number) => {
  const role = await RoleModel.findByPk(id);
  if (!role) {
    throw new Error("Role not found");
  }

  return await role.destroy();
};

export const getRoleById = async (id: number) => {
  const role = await RoleModel.findByPk(id);
  if (!role) {
    throw new Error("Role not found");
  }

  return role;
};

export const getAllRoles = async () => {
  return await RoleModel.findAll();
};

export const getRolesUserView = async () => {
  return await RoleModel.findAll({
    attributes: ['id', 'name'],
    where: {
      user_view: true,
    },
    order: [['sort_order', 'ASC']],
  });
};
