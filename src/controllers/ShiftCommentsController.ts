import { Context } from "koa";
import * as ShiftCommentsService from "../services/shiftCommentsService";

export const createShiftComment = async (ctx: Context) => {
  try {
    const user_id = ctx.state.user.id;
    const { shift_id, description, swap_request_id } = ctx.request.body;
    const result = await ShiftCommentsService.createShiftComment(
      shift_id,
      user_id,
      swap_request_id,
      description
    );
    ctx.status = 201;
    ctx.body = { message: "Shift comment created successfully", result };
  } catch (error: any) {
    ctx.status = 400;
    ctx.body = { error: error.message || "Failed to create shift comment" };
  }
};

export const getShiftComments = async (ctx: Context) => {
  try {
    const result = await ShiftCommentsService.getShiftComments();
    ctx.status = 200;
    ctx.body = { shift_comments: result };
  } catch (error: any) {
    ctx.status = 400;
    ctx.body = { error: error.message || "Failed to fetch shift comments" };
  }
};

// not test yet
export const getShiftCommentsByShiftId = async (ctx: Context) => {
  try {
    const userId = ctx.state.user.id;
    const { shift_id } = ctx.params;
    const result = await ShiftCommentsService.getShiftCommentsByShiftId(
      userId,
      Number(shift_id)
    );
    ctx.status = 200;
    ctx.body = { shift_comments: result };
  } catch (error: any) {
    ctx.status = 400;
    ctx.body = {
      error: error.message || "Failed to fetch shift comments by shift ID",
    };
  }
};

// Master
export const getShiftCommentsByShiftIdMaster = async (ctx: Context) => {
  try {
    const userId = ctx.state.user.id;
    // const userId = 201; // For testing purposes, using a hardcoded user ID
    const { shift_id } = ctx.params;
    const result = await ShiftCommentsService.getShiftCommentsByShiftIdMaster(
      userId,
      Number(shift_id)
    );
    ctx.status = 200;
    ctx.body = { shift_comments: result };
  } catch (error: any) {
    ctx.status = 400;
    ctx.body = {
      error: error.message || "Failed to fetch shift comments by shift ID",
    };
  }
};

// not test yet
export const getShiftCommentById = async (ctx: Context) => {
  try {
    const { id } = ctx.params;
    const result = await ShiftCommentsService.getShiftCommentById(Number(id));
    ctx.status = 200;
    ctx.body = { shift_comment: result };
  } catch (error: any) {
    ctx.status = 400;
    ctx.body = {
      error: error.message || "Failed to fetch shift comment by ID",
    };
  }
};

// not test yet
export const updateShiftComment = async (ctx: Context) => {
  try {
    const { id } = ctx.params;
    const { description } = ctx.request.body;
    const result = await ShiftCommentsService.updateShiftComment(
      Number(id),
      description
    );
    ctx.status = 200;
    ctx.body = { message: "Shift comment updated successfully", result };
  } catch (error: any) {
    ctx.status = 400;
    ctx.body = { error: error.message || "Failed to update shift comment" };
  }
};

// not test yet
export const deleteShiftComment = async (ctx: Context) => {
  try {
    const { id } = ctx.params;
    await ShiftCommentsService.deleteShiftComment(Number(id));
    ctx.status = 204;
  } catch (error: any) {
    ctx.status = 400;
    ctx.body = { error: error.message || "Failed to delete shift comment" };
  }
};

export const getSwapRequestCommentsToTarget = async (ctx: Context) => {
  try {
    const userId = ctx.state.user.id;
    const { swapRequestId } = ctx.params;
    const result = await ShiftCommentsService.getSwapRequestCommentsToTarget(
      Number(swapRequestId),
      userId
    );
    ctx.status = 200;
    ctx.body = result;
  } catch (error: any) {
    console.error("Error fetching swap request comments:", error);
    ctx.status = error.message === "Swap request not found" ? 404 : 500;
    ctx.body = { error: error.message || "Internal Server Error" };
  }
};
