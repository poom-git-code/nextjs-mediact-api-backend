import { Context } from "koa";
import * as ProvinceService from "../services/provinceService";

export const getAllProvinces = async (ctx: Context) => {
  ctx.body = { provinces: await ProvinceService.getAllProvinces() };
};

export const getProvinceById = async (ctx: Context) => {
  const province = await ProvinceService.getProvinceById(Number(ctx.params.id));
  if (!province) {
    ctx.status = 404;
    ctx.body = { error: "Province not found" };
    return;
  }
  ctx.body = { province };
};

export const createProvince = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    const province = await ProvinceService.createProvince(ctx.request.body, userId);
    ctx.body = { province };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};

export const updateProvince = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    const province = await ProvinceService.updateProvince(Number(ctx.params.id), ctx.request.body, userId);
    ctx.body = { province };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};

export const deleteProvince = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    await ProvinceService.deleteProvince(Number(ctx.params.id), userId);
    ctx.body = { success: true };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};