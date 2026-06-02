import CategoryMasterModel from '../models/CategoryMasterModel';

export const getAllCategories = async (filters: { scope?: string; is_active?: number } = {}) => {
  const whereClause: any = {};
  if (filters.scope) whereClause.scope = filters.scope;
  if (typeof filters.is_active !== 'undefined') whereClause.is_active = filters.is_active;

  return await CategoryMasterModel.findAll({ where: whereClause, order: [['code', 'ASC']] });
};

export const getCategoryById = async (id: number) => {
  return await CategoryMasterModel.findByPk(id);
};

export const createCategory = async (data: any, userId?: number) => {
  return await CategoryMasterModel.create({ ...data, created_by: userId, updated_by: userId } as any);
};

export const updateCategory = async (id: number, updates: any, userId?: number) => {
  const category = await CategoryMasterModel.findByPk(id);
  if (!category) throw new Error('Category not found');
  return await category.update({ ...updates, updated_by: userId } as any);
};

export const deleteCategory = async (id: number) => {
  const category = await CategoryMasterModel.findByPk(id);
  if (!category) throw new Error('Category not found');
  return await category.destroy();
};

import * as UserRoleService from './userRoleService';

export const getCategoriesByUserRoles = async (userId: number) => {

  const roles = await UserRoleService.getUserRoles(userId);

  const roleIds = roles.map((r: any) => Number(r.get('role_id'))).filter((n: number) => !isNaN(n));

  // - doctor role id = 2
  // - nurse role ids = 30, 5 (observed in userProfileCompletenessService)
  const includeDoctor = roleIds.includes(2);
  const includeNurse = roleIds.includes(30) || roleIds.includes(5);

  // Build where clause: include 'both' plus any scopes matched by roles
  const whereClause: any = { is_active: 1 };
  if (includeDoctor && includeNurse) {
    // both roles -> return everything where scope in ('doctor','nurse','both')
    whereClause.scope = ['doctor', 'nurse', 'both'];
  } else if (includeDoctor) {
    whereClause.scope = ['doctor', 'both'];
  } else if (includeNurse) {
    whereClause.scope = ['nurse', 'both'];
  } else {
    // No matching role -> return only 'both' scope as a safe default
    whereClause.scope = ['both'];
  }

  return await CategoryMasterModel.findAll({ where: whereClause, order: [['code', 'ASC']] });
};


