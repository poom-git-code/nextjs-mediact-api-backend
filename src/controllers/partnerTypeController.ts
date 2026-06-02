import { Context } from "koa";
import * as PartnerTypeService from "../services/partnerTypeService";

export const getAllPartnerTypes = async (ctx: Context) => {
  ctx.body = { partner_types: await PartnerTypeService.getAllPartnerType() };
};

export const getPartnerTypeById = async (ctx: Context) => {
  const partner_type = await PartnerTypeService.getPartnerTypeById(Number(ctx.params.id));
  if (!partner_type) {
    ctx.status = 404;
    ctx.body = { error: "Partner type not found" };
    return;
  }
  ctx.body = { partner_type };
};

export const createPartnerType = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    const partner_type = await PartnerTypeService.createPartnerType(ctx.request.body, userId);
    ctx.body = { partner_type };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};

export const updatePartnerType = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    const partner_type = await PartnerTypeService.updatePartnerType(Number(ctx.params.id), ctx.request.body, userId);
    ctx.body = { partner_type };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};

export const deletePartnerType = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    await PartnerTypeService.deletePartnerType(Number(ctx.params.id), userId);
    ctx.body = { success: true };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};