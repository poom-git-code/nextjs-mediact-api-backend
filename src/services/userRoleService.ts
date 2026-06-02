import UserRoleModel from '../models/UserRolesModel';

export const assignRoleToUser = async (data: any) => {
  return await UserRoleModel.create(data);
};

export const updateUserRole = async (id: number, updates: Partial<UserRoleModel>) => {
  const userRole = await UserRoleModel.findByPk(id);
  if (!userRole) {
    throw new Error('UserRole not found');
  }
  return await userRole.update(updates);
};

export const deleteUserRole = async (id: number) => {
  const userRole = await UserRoleModel.findByPk(id);
  if (!userRole) {
    throw new Error('UserRole not found');
  }
  return await userRole.destroy();
};

export const getUserRoles = async (user_id: number) => {
  return await UserRoleModel.findAll({ where: { user_id } });
};

export const getAllUserRoles = async () => {
  return await UserRoleModel.findAll();
};

export const deleteAllRolesForUser = async (user_id: number) => {
  const roles = await UserRoleModel.findAll({ where: { user_id } });
  await Promise.all(roles.map((role) => role.destroy()));
};