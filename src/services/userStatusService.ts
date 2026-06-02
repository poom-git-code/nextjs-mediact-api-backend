import UserStatusModel from '../models/UserStatusModel';

export const assignStatusToUser = async (data: any) => {
  return await UserStatusModel.create(data);
};

export const updateUserStatus = async (id: number, updates: Partial<UserStatusModel>) => {
  const userStatus = await UserStatusModel.findByPk(id);
  if (!userStatus) {
    throw new Error('UserStatus not found');
  }
  return await userStatus.update(updates);
};

export const deleteUserStatus = async (id: number) => {
  const userStatus = await UserStatusModel.findByPk(id);
  if (!userStatus) {
    throw new Error('UserStatus not found');
  }
  return await userStatus.destroy();
};

export const getUserStatuses = async (user_id: number) => {
  return await UserStatusModel.findAll({ where: { user_id } });
};

export const getAllUserStatuses = async () => {
  return await UserStatusModel.findAll();
};