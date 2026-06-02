import SubCategoryMasterModel from "../models/SubCategoryMasterModel";

/**
 * Fetches all sub-categories with optional filtering.
 * @param {object} filters - Optional filters.
 * @param {number} filters.category_id - Filter by the parent category ID.
 * @param {number} filters.is_active - Filter by active status (1 for active, 0 for inactive).
 * @returns {Promise<SubCategoryMasterModel[]>}
 */
export const getAllSubCategoriesBackoffice = async (filters: { category_id?: number; is_active?: number } = {}) => {
    const whereClause: any = {};
    if (filters.category_id) {
        whereClause.category_id = filters.category_id;
    }
    if (typeof filters.is_active !== 'undefined') {
        whereClause.is_active = filters.is_active;
    }

    return await SubCategoryMasterModel.findAll({
        where: whereClause,
        order: [['code', 'ASC']]
    });
};

/**
 * Fetches a single sub-category by its primary key.
 * @param {number} id - The ID of the sub-category.
 * @returns {Promise<SubCategoryMasterModel | null>}
 */
export const getSubCategoryById = async (id: number) => {
    return await SubCategoryMasterModel.findByPk(id);
};

/**
 * Creates a new sub-category.
 * @param {any} data - The data for the new sub-category.
 * @param {number} [userId] - The ID of the user creating the record.
 * @returns {Promise<SubCategoryMasterModel>}
 */
export const createSubCategory = async (data: any, userId?: number) => {
    return await SubCategoryMasterModel.create({
        ...data,
        createdBy: userId,
        updatedBy: userId
    });
};

/**
 * Updates an existing sub-category.
 * @param {number} id - The ID of the sub-category to update.
 * @param {any} updates - The fields to update.
 * @param {number} [userId] - The ID of the user performing the update.
 * @returns {Promise<SubCategoryMasterModel>}
 */
export const updateSubCategory = async (id: number, updates: any, userId?: number) => {
    const subCategory = await SubCategoryMasterModel.findByPk(id);
    if (!subCategory) {
        throw new Error('Sub-category not found');
    }
    return await subCategory.update({
        ...updates,
        updated_by: userId
    });
};

/**
 * Deletes a sub-category.
 * @param {number} id - The ID of the sub-category to delete.
 * @returns {Promise<void>}
 */
export const deleteSubCategory = async (id: number) => {
    const subCategory = await SubCategoryMasterModel.findByPk(id);
    if (!subCategory) {
        throw new Error('Sub-category not found');
    }
    return await subCategory.destroy();
};

export const getAllSubCategories = async (filters: { is_active?: number } = {}) => {
  const whereClause: any = {};
  if (typeof filters.is_active !== 'undefined') whereClause.is_active = filters.is_active;

  return await SubCategoryMasterModel.findAll({ where: whereClause, order: [['code', 'ASC']] });
};

export const getSubCategoriesByCategoryId = async (categoryId: number, filters: { is_active?: number } = {}) => {
  const whereClause: any = { category_id: categoryId };
  if (typeof filters.is_active !== 'undefined') whereClause.is_active = filters.is_active;

  return await SubCategoryMasterModel.findAll({ where: whereClause, order: [['code', 'ASC']] });
};

export default {
  getAllSubCategories,
  getSubCategoriesByCategoryId,
};
