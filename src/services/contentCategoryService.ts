import ContentCategoryModel from "../models/ContentCategoryModle";

export const createCategory = async (data: any, userId: number) => {
  return await ContentCategoryModel.create({
    ...data,
    created_by: userId,
    updated_by: userId,
  });
};

export const getAllCategories = async () => {
  return await ContentCategoryModel.findAll({
    where: { is_active: true },
    order: [["sort_order", "ASC"]],
  });
};

export const getAllCategoriesManagement = async () => {
  return await ContentCategoryModel.findAll({
    // where: { is_active: true },
    order: [["sort_order", "ASC"]],
  });
};

export const getCategoryById = async (id: number) => {
  const category = await ContentCategoryModel.findByPk(id);
  if (!category) throw new Error("Category not found");
  return category;
};

export const updateCategory = async (id: number, updates: any, userId: number) => {
  const category = await ContentCategoryModel.findByPk(id);
  if (!category) throw new Error("Category not found");
  return await category.update({ ...updates, updated_by: userId });
};

export const deleteCategory = async (id: number, userId: number) => {
  const category = await ContentCategoryModel.findByPk(id);
  if (!category) throw new Error("Category not found");
  return await category.update({ is_active: false, updated_by: userId });
};