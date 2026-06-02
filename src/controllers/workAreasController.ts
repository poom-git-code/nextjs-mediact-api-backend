import { Context } from "koa";
import * as WorkAreasService from "../services/workAreasService";
import { createWorkAreaSchema, updateWorkAreaSchema } from "../validations/workAreasValidation";

export const createWorkArea = async (ctx: Context) => {
  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized" };
    return;
  }

  const { error, value } = createWorkAreaSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
  
  const created = await WorkAreasService.createWorkArea(value, userId);
    ctx.status = 201;
    ctx.body = { message: "Work area created", work_area: created };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const updateWorkArea = async (ctx: Context) => {
  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized" };
    return;
  }

  const { id } = ctx.params;
  const { error, value } = updateWorkAreaSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
  const updated = await WorkAreasService.updateWorkArea(parseInt(id, 10), value, userId);
    ctx.body = { message: "Work area updated", work_area: updated };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const deleteWorkArea = async (ctx: Context) => {
  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized" };
    return;
  }

  const { id } = ctx.params;
  try {
    await WorkAreasService.deleteWorkArea(parseInt(id, 10), userId);
    ctx.body = { message: "Work area deleted" };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getAllWorkAreas = async (ctx: Context) => {
  try {
    const rows = await WorkAreasService.getAllWorkAreas();
    const formatted = rows.map((r: any) => {
      const obj = typeof r.toJSON === "function" ? r.toJSON() : r;
      return { ...obj, district: obj.district ? String(obj.district).split(",").map((s: string) => Number(s)) : [] };
    });
    ctx.body = { work_areas: formatted };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getWorkAreasByUserId = async (ctx: Context) => {
  
  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized" };
    return;
  }

  try {
    const rows = await WorkAreasService.getWorkAreasByUserId(userId);
      const formatted = rows.map((w: any) => ({
        ...w,
        // keep district as an array of numbers
        district: Array.isArray(w.district) ? w.district : String(w.district).split(",").map((d: string) => Number(d)),
        // expose plural arrays returned from service
        job_types: w.job_types || [],
        facility_types: w.facility_types || []
      }));
    ctx.body = { work_areas: formatted };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};
