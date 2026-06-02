import { Context } from "koa";
import * as InstitutionService from "../services/institutionService";

export const getAllInstitutions = async (ctx: Context) => {
  ctx.body = { institutions: await InstitutionService.getAllInstitutions() };
};

export const getInstitutionById = async (ctx: Context) => {
  const institution = await InstitutionService.getInstitutionById(Number(ctx.params.id));
  if (!institution) {
    ctx.status = 404;
    ctx.body = { error: "Institution not found" };
    return;
  }
  ctx.body = { institution };
};

export const createInstitution = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    const institution = await InstitutionService.createInstitution(ctx.request.body, userId);
    ctx.body = { institution };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};

export const updateInstitution = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    const institution = await InstitutionService.updateInstitution(Number(ctx.params.id), ctx.request.body, userId);
    ctx.body = { institution };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};

export const deleteInstitution = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    await InstitutionService.deleteInstitution(Number(ctx.params.id), userId);
    ctx.body = { success: true };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};