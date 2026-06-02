import { Context } from "koa";
import * as GiveShiftRequestService from "../services/giveShiftRequestService";
import {
  createGiveShiftRequestSchema,
  updateGiveShiftRequestSchema,
} from "../validations/giveShiftRequestValidation";

export const createGiveShiftRequest = async (ctx: Context) => {
  const { error, value } = createGiveShiftRequestSchema.validate(
    ctx.request.body
  );
  const user_id = ctx.state.user.id;
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }
  try {
    const request = await GiveShiftRequestService.createGiveShiftRequest({
      ...value,
      user_id,
      created_by: user_id,
      updated_by: user_id,
    });
    ctx.status = 201;
    ctx.body = { message: "Give shift request created successfully", request };
  } catch (err) {
    ctx.status = 400;
    ctx.body = { error: err instanceof Error ? err.message : "Unknown error" };
  }
};

export const updateGiveShiftRequest = async (ctx: Context) => {
  const { id } = ctx.params;
  const { error, value } = updateGiveShiftRequestSchema.validate(
    ctx.request.body
  );
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }
  try {
    const request = await GiveShiftRequestService.updateGiveShiftRequest(
      parseInt(id, 10),
      value
    );
    ctx.body = { message: "Request updated successfully", request };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const deleteGiveShiftRequest = async (ctx: Context) => {
  const { id } = ctx.params;
  try {
    await GiveShiftRequestService.deleteGiveShiftRequest(parseInt(id, 10));
    ctx.body = { message: "Request deleted successfully" };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getGiveShiftRequestById = async (ctx: Context) => {
  const { id } = ctx.params;
  try {
    const request = await GiveShiftRequestService.getGiveShiftRequestById(
      parseInt(id, 10)
    );
    ctx.body = { request };
  } catch (err: any) {
    ctx.status = 404;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getGiveShiftRequestsByUserId = async (ctx: Context) => {
  const user_id = ctx.state.user.id;
  try {
    const requests = await GiveShiftRequestService.getGiveShiftRequestsByUserId(
      user_id
    );
    ctx.body = { requests };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getGiveShiftRequestsByUserIdMobile = async (ctx: Context) => {
  const user_id = ctx.state.user.id;
  try {
    const requests = await GiveShiftRequestService.getGiveShiftRequestsByUserIdMobile(
      user_id
    );
    ctx.body = { requests };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getGiveShiftRequestsByUserIdTargeterMobile = async (ctx: Context) => {
  const user_id = ctx.state.user.id;
  try {
    const requests = await GiveShiftRequestService.getGiveShiftRequestsByUserIdTargeterMobile(
      user_id
    );
    ctx.body = { requests };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getAllGiveShiftRequests = async (ctx: Context) => {
  try {
    const requests = await GiveShiftRequestService.getAllGiveShiftRequests();
    ctx.body = { requests };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getGiveShiftRequestsForSupervisor = async (ctx: Context) => {
  const user_id = ctx.state.user.id;
  try {
    const requests = await GiveShiftRequestService.getGiveShiftRequestsForSupervisor(
      user_id
    );
    ctx.body = { requests };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getGiveShiftRequestsByDepartmentMonthYear = async (
  ctx: Context
) => {
  const { departmentId, month, year } = ctx.params;
  const deptId = parseInt(departmentId, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  if (isNaN(deptId) || isNaN(monthNum) || isNaN(yearNum)) {
    ctx.status = 400;
    ctx.body = { error: "Invalid parameters" };
    return;
  }
  try {
    const requests =
      await GiveShiftRequestService.getGiveShiftRequestsByDepartmentMonthYear(
        deptId,
        monthNum,
        yearNum
      );
    ctx.body = {
      requests,
      filters: { departmentId: deptId, month: monthNum, year: yearNum },
    };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

// [ACTION] User B (Target) Actions
export const approveGiveShiftRequest = async (ctx: Context) => {
  const { requestId } = ctx.params;
  const { comment } = ctx.request.body;
  const userId = ctx.state.user.id;

  try {
    const result = await GiveShiftRequestService.approveGiveShiftRequest(
      parseInt(requestId, 10),
      userId,
      comment
    );
    ctx.status = 200;
    ctx.body = { message: "Request approved by target user", ...result };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const rejectGiveShiftRequest = async (ctx: Context) => {
  const { requestId } = ctx.params;
  const { comment } = ctx.request.body;
  const userId = ctx.state.user.id;

  try {
    const request = await GiveShiftRequestService.rejectGiveShiftRequest(
      parseInt(requestId, 10),
      userId,
      comment
    );
    ctx.status = 200;
    ctx.body = { message: "Request rejected by target user", request };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

// [ACTION] Supervisor Actions (Final Approval)
export const approveGiveShiftRequestSupervisor = async (ctx: Context) => {
  const { requestId } = ctx.params;
  const { comment } = ctx.request.body;
  const userId = ctx.state.user.id;

  try {
    const result =
      await GiveShiftRequestService.approveGiveShiftRequestSupervisor(
        parseInt(requestId, 10),
        comment,
        userId
      );
    ctx.status = 200;
    ctx.body = { message: "Request approved by supervisor", ...result };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const rejectGiveShiftRequestSupervisor = async (ctx: Context) => {
  const { requestId } = ctx.params;
  const { comment } = ctx.request.body;
  const userId = ctx.state.user.id;

  try {
    const request =
      await GiveShiftRequestService.rejectGiveShiftRequestSupervisor(
        parseInt(requestId, 10),
        comment,
        userId
      );
    ctx.status = 200;
    ctx.body = { message: "Request rejected by supervisor", request };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};
