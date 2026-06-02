import { Context } from "koa";
import * as GenderService from "../services/genderService";

export const getAllGenders = async (ctx: Context) => {
  ctx.body = { genders: await GenderService.getAllGenders() };
};

export const getGenderById = async (ctx: Context) => {
  const gender = await GenderService.getGenderById(Number(ctx.params.id));
  if (!gender) {
    ctx.status = 404;
    ctx.body = { error: "Gender not found" };
    return;
  }
  ctx.body = { gender };
};

export const createGender = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    const gender = await GenderService.createGender(ctx.request.body, userId);
    ctx.body = { gender };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};

export const updateGender = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    const gender = await GenderService.updateGender(Number(ctx.params.id), ctx.request.body, userId);
    ctx.body = { gender };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};

export const deleteGender = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    await GenderService.deleteGender(Number(ctx.params.id), userId);
    ctx.body = { success: true };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};