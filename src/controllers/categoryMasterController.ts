import { Context } from 'koa';
import * as CategoryService from '../services/categoryMasterService';

export const getAllCategories = async (ctx: Context) => {
  try {
    const { scope, is_active } = ctx.query as any;
    const filters: any = {};
    if (scope) filters.scope = scope;
    if (typeof is_active !== 'undefined') filters.is_active = parseInt(is_active, 10);

    const categories = await CategoryService.getAllCategories(filters);
    ctx.status = 200;
    ctx.body = { success: true, data: categories };
  } catch (error) {
    console.error('Error getting categories:', error);
    ctx.status = 500;
    ctx.body = { success: false, error: 'INTERNAL_ERROR', message: (error as Error).message };
  }
};

export const getCategoriesByUserRole = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    if (!userId) {
      ctx.status = 401;
      ctx.body = { success: false, error: 'UNAUTHORIZED', message: 'User not authenticated' };
      return;
    }

    const categories = await CategoryService.getCategoriesByUserRoles(Number(userId));
    ctx.status = 200;
    ctx.body = { success: true, data: categories };
  } catch (error) {
    console.error('Error getting categories by user role:', error);
    ctx.status = 500;
    ctx.body = { success: false, error: 'INTERNAL_ERROR', message: (error as Error).message };
  }
};

export default {
  getAllCategories,
  getCategoriesByUserRole
};
