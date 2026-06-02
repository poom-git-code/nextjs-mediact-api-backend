import { Context } from 'koa';
import * as SubCategoryService from '../services/subCategoryMasterService';

/**
 * Get all sub-categories, with optional filters.
 * GET /sub-categories?category_id=1&is_active=1
 */
export const getAllSubCategoriesBackoffice = async (ctx: Context) => {
    try {
        const { category_id, is_active } = ctx.query as any;
        const filters: any = {};

        if (category_id) {
            filters.category_id = parseInt(category_id, 10);
        }
        if (typeof is_active !== 'undefined') {
            filters.is_active = parseInt(is_active, 10);
        }

        const subCategories = await SubCategoryService.getAllSubCategoriesBackoffice(filters);
        ctx.status = 200;
        ctx.body = { success: true, data: subCategories };
    } catch (error) {
        console.error('Error getting sub-categories:', error);
        ctx.status = 500;
        ctx.body = { success: false, error: 'INTERNAL_ERROR', message: (error as Error).message };
    }
};

/**
 * Get a single sub-category by its ID.
 * GET /sub-categories/:id
 */
export const getSubCategoryById = async (ctx: Context) => {
    try {
        const id = parseInt(ctx.params.id, 10);
        const subCategory = await SubCategoryService.getSubCategoryById(id);

        if (subCategory) {
            ctx.status = 200;
            ctx.body = { success: true, data: subCategory };
        } else {
            ctx.status = 404;
            ctx.body = { success: false, error: 'NOT_FOUND', message: 'Sub-category not found' };
        }
    } catch (error) {
        console.error(`Error getting sub-category with id ${ctx.params.id}:`, error);
        ctx.status = 500;
        ctx.body = { success: false, error: 'INTERNAL_ERROR', message: (error as Error).message };
    }
};

/**
 * Create a new sub-category.
 * POST /sub-categories
 */
export const createSubCategory = async (ctx: Context) => {
    try {
        const data = ctx.request.body;
        const userId = ctx.state.user?.id;

        const newSubCategory = await SubCategoryService.createSubCategory(data, userId);
        ctx.status = 201;
        ctx.body = { success: true, data: newSubCategory };
    } catch (error) {
        console.error('Error creating sub-category:', error);
        ctx.status = 400;
        ctx.body = { success: false, error: 'BAD_REQUEST', message: (error as Error).message };
    }
};

/**
 * Update an existing sub-category.
 * PUT /sub-categories/:id
 */
export const updateSubCategory = async (ctx: Context) => {
    try {
        const id = parseInt(ctx.params.id, 10);
        const updates = ctx.request.body;
        const userId = ctx.state.user?.id;

        const updatedSubCategory = await SubCategoryService.updateSubCategory(id, updates, userId);
        ctx.status = 200;
        ctx.body = { success: true, data: updatedSubCategory };
    } catch (error) {
        console.error(`Error updating sub-category with id ${ctx.params.id}:`, error);
        if ((error as Error).message === 'Sub-category not found') {
            ctx.status = 404;
            ctx.body = { success: false, error: 'NOT_FOUND', message: (error as Error).message };
        } else {
            ctx.status = 400;
            ctx.body = { success: false, error: 'BAD_REQUEST', message: (error as Error).message };
        }
    }
};

/**
 * Delete a sub-category.
 * DELETE /sub-categories/:id
 */
export const deleteSubCategory = async (ctx: Context) => {
    try {
        const id = parseInt(ctx.params.id, 10);
        await SubCategoryService.deleteSubCategory(id);
        ctx.status = 204;
    } catch (error) {
        console.error(`Error deleting sub-category with id ${ctx.params.id}:`, error);
        if ((error as Error).message === 'Sub-category not found') {
            ctx.status = 404;
            ctx.body = { success: false, error: 'NOT_FOUND', message: (error as Error).message };
        } else {
            ctx.status = 500;
            ctx.body = { success: false, error: 'INTERNAL_ERROR', message: (error as Error).message };
        }
    }
};

export const getAllSubCategories = async (ctx: Context) => {
    try {
        const is_active = ctx.query.is_active !== undefined ? parseInt(ctx.query.is_active as string, 10) : undefined;
        const subCategories = await SubCategoryService.getAllSubCategories({ is_active });

        ctx.status = 200;
        ctx.body = { success: true, data: subCategories };
    } catch (error: any) {
        console.error('Error getting sub categories:', error);
        ctx.status = 500;
        ctx.body = { success: false, error: 'INTERNAL_ERROR', message: error.message };
    }
};

export const getSubCategoriesByCategoryId = async (ctx: Context) => {
    try {
        const categoryId = parseInt(ctx.params.categoryId, 10);
        if (isNaN(categoryId)) {
            ctx.status = 400;
            ctx.body = { success: false, error: 'INVALID_CATEGORY_ID', message: 'categoryId must be a number' };
            return;
        }

        const is_active = ctx.query.is_active !== undefined ? parseInt(ctx.query.is_active as string, 10) : undefined;
        const subCategories = await SubCategoryService.getSubCategoriesByCategoryId(categoryId, { is_active });

        ctx.status = 200;
        ctx.body = { success: true, data: subCategories };
    } catch (error: any) {
        console.error('Error getting sub categories by category id:', error);
        ctx.status = 500;
        ctx.body = { success: false, error: 'INTERNAL_ERROR', message: error.message };
    }
};

export default {
    getAllSubCategoriesBackoffice,
    getSubCategoryById,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
    getAllSubCategories,
    getSubCategoriesByCategoryId,
};
