import { Context } from "koa";
import * as ContentCategoryService from "../services/contentCategoryService";

export const createCategory = async (ctx: Context) => {
  const userId = ctx.state.user.id;
  try {
    const category = await ContentCategoryService.createCategory(ctx.request.body, userId);
    ctx.body = { category };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};

export const getAllCategories = async (ctx: Context) => {
  ctx.body = { categories: await ContentCategoryService.getAllCategories() };
};

export const getAllCategoriesManagement = async (ctx: Context) => {
  ctx.body = { categories: await ContentCategoryService.getAllCategoriesManagement() };
};

export const getCategoryById = async (ctx: Context) => {
  try {
    const category = await ContentCategoryService.getCategoryById(Number(ctx.params.id));
    ctx.body = { category };
  } catch (error) {
    ctx.status = 404;
    ctx.body = { error: (error as Error).message };
  }
};

export const updateCategory = async (ctx: Context) => {
  const userId = ctx.state.user.id;
  try {
    const category = await ContentCategoryService.updateCategory(
      Number(ctx.params.id),
      ctx.request.body,
      userId
    );
    ctx.body = { category };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};

export const deleteCategory = async (ctx: Context) => {
  const userId = ctx.state.user.id;
  try {
    await ContentCategoryService.deleteCategory(Number(ctx.params.id), userId);
    ctx.body = { success: true };
  } catch (error) {
    ctx.status = 404;
    ctx.body = { error: (error as Error).message };
  }
};