import { Context } from "koa";
import * as LeaveTypeService from "../services/leaveTypeService";
import { createLeaveTypeSchema, updateLeaveTypeSchema } from "../validations/leaveTypeValidation";

export const createLeaveType = async (ctx: Context) => {
  const { error, value } = createLeaveTypeSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }
  try {
    const leaveType = await LeaveTypeService.createLeaveType(value);
    ctx.status = 201;
    ctx.body = { message: "Leave type created successfully", leaveType };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const updateLeaveType = async (ctx: Context) => {
  const { id } = ctx.params;
  const { error, value } = updateLeaveTypeSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }
  try {
    const leaveType = await LeaveTypeService.updateLeaveType(parseInt(id, 10), value);
    ctx.body = { message: "Leave type updated successfully", leaveType };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const deleteLeaveType = async (ctx: Context) => {
  const { id } = ctx.params;
  try {
    await LeaveTypeService.deleteLeaveType(parseInt(id, 10));
    ctx.body = { message: "Leave type deleted successfully" };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getLeaveTypeById = async (ctx: Context) => {
  const { id } = ctx.params;
  try {
    const leaveType = await LeaveTypeService.getLeaveTypeById(parseInt(id, 10));
    ctx.body = { leaveType };
  } catch (err: any) {
    ctx.status = 404;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getAllLeaveTypes = async (ctx: Context) => {
  try {
    const leaveTypes = await LeaveTypeService.getAllLeaveTypes();
    ctx.body = { leaveTypes };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};