import { Context } from "koa";
import * as DayOffService from "../services/dayOffService";
import {
  createDayOffSchema,
  updateDayOffSchema,
} from "../validations/dayOffValidation";

export const createDayOff = async (ctx: Context) => {
  const { error, value } = createDayOffSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }
  try {
    const dayOff = await DayOffService.createDayOff(value);
    ctx.status = 201;
    ctx.body = { message: "Day off request created successfully", dayOff };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const updateDayOff = async (ctx: Context) => {
  const { id } = ctx.params;
  const { error, value } = updateDayOffSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }
  try {
    const dayOff = await DayOffService.updateDayOff(parseInt(id, 10), value);
    ctx.body = { message: "Day off request updated successfully", dayOff };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const deleteDayOff = async (ctx: Context) => {
  const { id } = ctx.params;
  try {
    await DayOffService.deleteDayOff(parseInt(id, 10));
    ctx.body = { message: "Day off request deleted successfully" };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getDayOffById = async (ctx: Context) => {
  const { id } = ctx.params;
  try {
    const dayOff = await DayOffService.getDayOffById(parseInt(id, 10));
    ctx.body = { dayOff };
  } catch (err: any) {
    ctx.status = 404;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getAllDayOffs = async (ctx: Context) => {
  try {
    const dayOffs = await DayOffService.getAllDayOffs();
    ctx.body = { dayOffs };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getAllDayOffsByFacility = async (ctx: Context) => {
  const userId = ctx.state.user.id;

  try {
    const dayOffs = await DayOffService.getDayOffsByFacility(
      parseInt(userId, 10)
    );
    ctx.body = { dayOffs };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getDayOffsByUserId = async (ctx: Context) => {
  const userId = ctx.state.user.id;

  try {
    const dayOffs = await DayOffService.getDayOffsByUserId(
      parseInt(userId, 10)
    );
    ctx.body = { dayOffs };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const approveDayOff = async (ctx: Context) => {
  const { id } = ctx.params;
  const { remark } = ctx.request.body as any;
  const approveUserId = ctx.state?.user.id;

  if (!approveUserId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized: User ID not found" };
    return;
  }

  try {
    const dayOff = await DayOffService.approveDayOff(
      parseInt(id, 10), 
      approveUserId, 
      remark
    );
    ctx.body = { 
      message: "Day off request approved successfully", 
      dayOff 
    };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const rejectDayOff = async (ctx: Context) => {
  const { id } = ctx.params;
  const { remark } = ctx.request.body as any;
  const approveUserId = ctx.state?.user.id;

  if (!approveUserId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized: User ID not found" };
    return;
  }

  try {
    const dayOff = await DayOffService.rejectDayOff(
      parseInt(id, 10), 
      approveUserId, 
      remark
    );
    ctx.body = { 
      message: "Day off request rejected successfully", 
      dayOff 
    };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};
