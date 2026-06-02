import { Context } from "koa";
import * as SubdistrictService from "../services/subdistrictService";

export const getAllSubdistricts = async (ctx: Context) => {
  ctx.body = { subdistricts: await SubdistrictService.getAllSubdistricts() };
};

export const getSubdistrictById = async (ctx: Context) => {
  const subdistrict = await SubdistrictService.getSubdistrictById(Number(ctx.params.id));
  if (!subdistrict) {
    ctx.status = 404;
    ctx.body = { error: "Subdistrict not found" };
    return;
  }
  ctx.body = { subdistrict };
};

export const getSubdistrictsByDistrictCode = async (ctx: Context) => {
  const district_code = Number(ctx.params.district_code);
  ctx.body = { subdistricts: await SubdistrictService.getSubdistrictsByDistrictCode(district_code) };
};

export const createSubdistrict = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    const subdistrict = await SubdistrictService.createSubdistrict(ctx.request.body, userId);
    ctx.body = { subdistrict };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};

export const updateSubdistrict = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    const subdistrict = await SubdistrictService.updateSubdistrict(Number(ctx.params.id), ctx.request.body, userId);
    ctx.body = { subdistrict };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};

export const deleteSubdistrict = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    await SubdistrictService.deleteSubdistrict(Number(ctx.params.id), userId);
    ctx.body = { success: true };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};