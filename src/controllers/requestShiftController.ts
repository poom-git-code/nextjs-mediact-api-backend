import { Context } from "koa";
import * as RequestShiftService from "../services/requestShiftService";
import {
  createRequestShiftSchema,
  updateRequestShiftSchema,
} from "../validations/requestShiftValidation";

export const createRequestShift = async (ctx: Context) => {
  const { error, value } = createRequestShiftSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }
  try {
    const requestShift = await RequestShiftService.createRequestShift(value);
    ctx.status = 201;
    ctx.body = { message: "Request shift created successfully", requestShift };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const updateRequestShift = async (ctx: Context) => {
  const { id } = ctx.params;
  const userId = ctx.state.user.id;

  const { error, value } = updateRequestShiftSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }
  try {
    const requestShift = await RequestShiftService.updateRequestShift(
      parseInt(id, 10),
      value,
      parseInt(userId, 10)
    );
    ctx.body = { message: "Request shift updated successfully", requestShift };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const deleteRequestShift = async (ctx: Context) => {
  const { id } = ctx.params;
  try {
    await RequestShiftService.deleteRequestShift(parseInt(id, 10));
    ctx.body = { message: "Request shift deleted successfully" };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getRequestShiftById = async (ctx: Context) => {
  const { id } = ctx.params;
  try {
    const requestShift = await RequestShiftService.getRequestShiftById(
      parseInt(id, 10)
    );
    ctx.body = { requestShift };
  } catch (err: any) {
    ctx.status = 404;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getAllRequestShifts = async (ctx: Context) => {
  try {
    const requestShifts = await RequestShiftService.getAllRequestShifts();
    ctx.body = { requestShifts };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getRequestShiftsByUserId = async (ctx: Context) => {
  const userId = ctx.state.user.id;
  try {
    const requestShifts = await RequestShiftService.getRequestShiftsByUserId(
      parseInt(userId, 10)
    );
    ctx.body = { requestShifts };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getRequestShiftsByFacility = async (ctx: Context) => {
  const userId = ctx.state.user.id;
  try {
    const requestShifts = await RequestShiftService.getRequestShiftsByFacility(
      parseInt(userId, 10)
    );
    ctx.body = { requestShifts };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const approveRequestShift = async (ctx: Context) => {
  const { id } = ctx.params;
  const { remark } = ctx.request.body as any;
  const approveUserId = ctx.state?.user.id;

  if (!approveUserId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized: User ID not found" };
    return;
  }

  try {
    const requestShift = await RequestShiftService.approveRequestShift(
      parseInt(id, 10),
      approveUserId,
      remark
    );
    ctx.body = { message: "Request shift approved successfully", requestShift };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const rejectRequestShift = async (ctx: Context) => {
  const { id } = ctx.params;
  const { remark } = ctx.request.body as any;
  const approveUserId = ctx.state?.user.id;

  if (!approveUserId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized: User ID not found" };
    return;
  }

  try {
    const requestShift = await RequestShiftService.rejectRequestShift(
      parseInt(id, 10),
      approveUserId,
      remark
    );
    ctx.body = { message: "Request shift rejected successfully", requestShift };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};
