import { Context } from "koa";
import * as LeaveRequestService from "../services/leaveRequestService";
import {
  createLeaveRequestSchema,
  updateLeaveRequestSchema,
} from "../validations/leaveRequestValidation";

export const createLeaveRequest = async (ctx: Context) => {
  const user_id = ctx.state.user.id;
  const { error, value } = createLeaveRequestSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }
  try {
    const leaveRequest = await LeaveRequestService.createLeaveRequest({
      ...value,
      user_id,
    });
    ctx.status = 201;
    ctx.body = { message: "Leave request created successfully", leaveRequest };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const updateLeaveRequest = async (ctx: Context) => {
  const { id } = ctx.params;
  const { error, value } = updateLeaveRequestSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }
  try {
    const leaveRequest = await LeaveRequestService.updateLeaveRequest(
      parseInt(id, 10),
      value
    );
    ctx.body = { message: "Leave request updated successfully", leaveRequest };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const deleteLeaveRequest = async (ctx: Context) => {
  const { id } = ctx.params;
  try {
    await LeaveRequestService.deleteLeaveRequest(parseInt(id, 10));
    ctx.body = { message: "Leave request deleted successfully" };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getLeaveRequestById = async (ctx: Context) => {
  const { id } = ctx.params;
  try {
    const leaveRequest = await LeaveRequestService.getLeaveRequestById(
      parseInt(id, 10)
    );
    ctx.body = { leaveRequest };
  } catch (err: any) {
    ctx.status = 404;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getAllLeaveRequests = async (ctx: Context) => {
  try {
    const leaveRequests = await LeaveRequestService.getAllLeaveRequests();
    ctx.body = { leaveRequests };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getLeaveRequestsByFacility = async (ctx: Context) => {
  const userId = ctx.state.user.id;

  // ตรวจสอบว่า userId เป็นตัวเลขที่ถูกต้อง
  if (!userId || isNaN(parseInt(userId, 10))) {
    ctx.status = 400;
    ctx.body = { error: "Invalid user ID" };
    return;
  }

  try {
    const leaveRequests = await LeaveRequestService.getLeaveRequestsByFacility(
      parseInt(userId, 10)
    );
    ctx.body = { leaveRequests };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getLeaveRequestsByUserId = async (ctx: Context) => {
  const userId = ctx.state.user.id;

  if (!userId || isNaN(parseInt(userId, 10))) {
    ctx.status = 400;
    ctx.body = { error: "Invalid user ID" };
    return;
  }

  try {
    const leaveRequests = await LeaveRequestService.getLeaveRequestsByUserId(
      parseInt(userId, 10)
    );
    ctx.status = 200;
    ctx.body = {
      leaveRequests,
    };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = {
      status: "error",
      message: err.message || "Unknown error",
    };
  }
};

export const getLeaveSummaryByUserId = async (ctx: Context) => {
  const userId = ctx.state.user.id;

  if (!userId || isNaN(parseInt(userId, 10))) {
    ctx.status = 400;
    ctx.body = { error: "Invalid user ID" };
    return;
  }

  try {
    const leaveSummary = await LeaveRequestService.getLeaveSummaryByUserId(
      parseInt(userId, 10)
    );
    ctx.status = 200;
    ctx.body = {
      status: "success",
      data: leaveSummary,
    };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = {
      status: "error",
      message: err.message || "Unknown error",
    };
  }
};

export const approveLeaveRequest = async (ctx: Context) => {
  const { id } = ctx.params;
  const { remark } = ctx.request.body as any;
  const approveUserId = ctx.state?.user.id;

  if (!approveUserId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized: User ID not found" };
    return;
  }

  try {
    const leaveRequest = await LeaveRequestService.approveLeaveRequest(
      parseInt(id, 10), 
      approveUserId, 
      remark
    );
    ctx.body = { 
      message: "Leave request approved successfully", 
      leaveRequest 
    };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const rejectLeaveRequest = async (ctx: Context) => {
  const { id } = ctx.params;
  const { remark } = ctx.request.body as any;
  const approveUserId = ctx.state?.user.id;

  if (!approveUserId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized: User ID not found" };
    return;
  }

  try {
    const leaveRequest = await LeaveRequestService.rejectLeaveRequest(
      parseInt(id, 10), 
      approveUserId, 
      remark
    );
    ctx.body = { 
      message: "Leave request rejected successfully", 
      leaveRequest 
    };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};
