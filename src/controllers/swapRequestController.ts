import { Context } from "koa";
import * as SwapRequestService from "../services/swapRequestService";
import * as ShiftCommentsService from "../services/shiftCommentsService";
import {
  createSwapRequestSchema,
  updateSwapRequestSchema,
} from "../validations/swapRequestValidation";

export const createSwapRequest = async (ctx: Context) => {
  const { error, value } = createSwapRequestSchema.validate(ctx.request.body);
  const user_id = ctx.state.user.id;

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    // console.log("Payload for SwapRequest:", {
    //   ...value,
    //   user_id,
    //   created_by: user_id,
    //   updated_by: user_id,
    // });
    const swapRequest = await SwapRequestService.createSwapRequest({
      ...value,
      user_id,
      created_by: user_id,
      updated_by: user_id,
    });
    // console.log("Creating shift comment with:", {
    //   shift_id: swapRequest.shift_id,
    //   user_id,
    //   swap_request_id: swapRequest.id,
    //   description: value.description,
    // });
    try {
      if (value.description) {
        await ShiftCommentsService.createShiftComment(
          swapRequest.shift_id,
          user_id,
          swapRequest.id,
          value.description
        );
      }
    } catch (err) {
      console.error("Error creating shift comment:", err);
      throw new Error("Failed to create shift comment");
    }

    ctx.status = 201;
    ctx.body = { message: "Swap request created successfully", swapRequest };
  } catch (err) {
    console.error("Error creating swap request:", err);
    ctx.status = 400;
    ctx.body = { error: err instanceof Error ? err.message : "Unknown error" };
  }
};

export const updateSwapRequest = async (ctx: Context) => {
  const { id } = ctx.params;
  const { error, value } = updateSwapRequestSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }
  try {
    const swapRequest = await SwapRequestService.updateSwapRequest(
      parseInt(id, 10),
      value
    );
    ctx.body = { message: "Swap request updated successfully", swapRequest };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const deleteSwapRequest = async (ctx: Context) => {
  const { id } = ctx.params;
  try {
    await SwapRequestService.deleteSwapRequest(parseInt(id, 10));
    ctx.body = { message: "Swap request deleted successfully" };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getSwapRequestByIdMobile = async (ctx: Context) => {
  const { id } = ctx.params;
  const userId = ctx.state.user?.id;
  try {
    const swapRequest = await SwapRequestService.getSwapRequestByIdMobile(
      parseInt(id, 10),
      userId
    );
    ctx.body = { swapRequest };
  } catch (err: any) {
    ctx.status = 404;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getSwapRequestById = async (ctx: Context) => {
  const { id } = ctx.params;
  try {
    const swapRequest = await SwapRequestService.getSwapRequestById(
      parseInt(id, 10)
    );
    ctx.body = { swapRequest };
  } catch (err: any) {
    ctx.status = 404;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getSwapRequestsByUserId = async (ctx: Context) => {
  console.log("Fetching all swap requests");
  const user_id = ctx.state.user.id;
  try {
    const swapRequests = await SwapRequestService.getSwapRequestsByUserId(
      user_id
    );
    ctx.body = { swapRequests };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getSwapRequestsFromFriend = async (ctx: Context) => {
  console.log("Fetching swap requests from friend");
  const target_user_id = ctx.state.user.id;
  try {
    const swapRequests = await SwapRequestService.getSwapRequestsFromFriend(
      target_user_id
    );
    ctx.body = { swapRequests };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getSwapRequestsForSupervisor = async (ctx: Context) => {
  console.log("Fetching swap requests for supervisor");
  const userId = ctx.state.user.id;
  try {
    const swapRequests = await SwapRequestService.getSwapRequestsForSupervisor(
      userId
    );
    ctx.body = { swapRequests };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getAllSwapRequests = async (ctx: Context) => {
  console.log("Fetching all swap requests");
  try {
    const swapRequests = await SwapRequestService.getAllSwapRequests();
    ctx.body = { swapRequests };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getSwapRequestsByDepartmentMonthYear = async (ctx: Context) => {
  const { departmentId, month, year } = ctx.params;

  // Validate parameters
  const deptId = parseInt(departmentId, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  if (isNaN(deptId) || isNaN(monthNum) || isNaN(yearNum)) {
    ctx.status = 400;
    ctx.body = {
      error:
        "Invalid parameters. Department ID, month, and year must be numbers.",
    };
    return;
  }

  if (monthNum < 1 || monthNum > 12) {
    ctx.status = 400;
    ctx.body = { error: "Month must be between 1 and 12." };
    return;
  }

  try {
    const swapRequests =
      await SwapRequestService.getSwapRequestsByDepartmentMonthYear(
        deptId,
        monthNum,
        yearNum
      );
    ctx.body = {
      swapRequests,
      filters: {
        departmentId: deptId,
        month: monthNum,
        year: yearNum,
      },
    };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const approveSwapRequest = async (ctx: Context) => {
  const { swapShiftId } = ctx.params;
  const { comment } = ctx.request.body;
  const userId = ctx.state.user.id;

  try {
    const swapRequest = await SwapRequestService.updateApproveSwapRequest(
      parseInt(swapShiftId, 10),
      comment,
      userId
    );
    ctx.status = 200;
    ctx.body = { message: "Swap request approved successfully", swapRequest };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const rejectSwapRequest = async (ctx: Context) => {
  const { swapShiftId } = ctx.params;
  const { comment } = ctx.request.body;
  const userId = ctx.state.user.id;

  try {
    const swapRequest = await SwapRequestService.updateRejectSwapRequest(
      parseInt(swapShiftId, 10),
      comment,
      userId
    );
    ctx.status = 200;
    ctx.body = { message: "Swap request rejected successfully", swapRequest };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const approveSwapRequestSupervisor = async (ctx: Context) => {
  const { swapRequestId } = ctx.params;
  const { comment } = ctx.request.body;
  console.log("Approving swap request supervisor:", {
    swapRequestId,
  });
  const userId = ctx.state.user.id;

  try {
    const swapRequest =
      await SwapRequestService.updateApproveSwapRequestSupervisor(
        parseInt(swapRequestId, 10),
        comment,
        userId
      );
    ctx.status = 200;
    ctx.body = { message: "Swap request approved successfully", swapRequest };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const rejectSwapRequestSupervisor = async (ctx: Context) => {
  const { swapRequestId } = ctx.params;
  const { comment } = ctx.request.body;
  const userId = ctx.state.user.id;

  try {
    const swapRequest =
      await SwapRequestService.updateRejectSwapRequestSupervisor(
        parseInt(swapRequestId, 10),
        comment,
        userId
      );
    ctx.status = 200;
    ctx.body = { message: "Swap request rejected successfully", swapRequest };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};
