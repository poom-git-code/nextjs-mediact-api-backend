import { Context } from "koa";
import * as DistrictService from "../services/districtService";

export const getAllDistricts = async (ctx: Context) => {
  ctx.body = { districts: await DistrictService.getAllDistricts() };
};

export const getDistrictById = async (ctx: Context) => {
  const district = await DistrictService.getDistrictById(Number(ctx.params.id));
  if (!district) {
    ctx.status = 404;
    ctx.body = { error: "District not found" };
    return;
  }
  ctx.body = { district };
};

export const getDistrictsByProvinceCode = async (ctx: Context) => {
  const province_code = Number(ctx.params.province_code);
  ctx.body = { districts: await DistrictService.getDistrictsByProvinceCode(province_code) };
};

export const createDistrict = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    const district = await DistrictService.createDistrict(ctx.request.body, userId);
    ctx.body = { district };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};

export const updateDistrict = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    const district = await DistrictService.updateDistrict(Number(ctx.params.id), ctx.request.body, userId);
    ctx.body = { district };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};

export const deleteDistrict = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    await DistrictService.deleteDistrict(Number(ctx.params.id), userId);
    ctx.body = { success: true };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};