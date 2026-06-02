import { Context } from "koa";
import * as JobApplyService from "../services/jobApplyService";
import { createJobApplySchema, updateJobApplySchema } from "../validations/jobApplyValidation";

export const createJobApply = async (ctx: Context) => {
  const { error, value } = createJobApplySchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }
  try {
    const userId = ctx.state?.user.id;
    const apply = await JobApplyService.createJobApply(value, userId);
    ctx.status = 201;
    ctx.body = { message: "Job application created successfully", apply };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const updateJobApply = async (ctx: Context) => {
  const { id } = ctx.params;
  const { error, value } = updateJobApplySchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }
  try {
    const apply = await JobApplyService.updateJobApply(parseInt(id, 10), value);
    ctx.body = { message: "Job application updated successfully", apply };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const deleteJobApply = async (ctx: Context) => {
  const { id } = ctx.params;
  try {
    await JobApplyService.deleteJobApply(parseInt(id, 10));
    ctx.body = { message: "Job application deleted successfully" };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getJobApplyById = async (ctx: Context) => {
  const { id } = ctx.params;
  try {
    const apply = await JobApplyService.getJobApplyById(parseInt(id, 10));
    ctx.body = { apply };
  } catch (err: any) {
    ctx.status = 404;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getAllJobApplies = async (ctx: Context) => {
  try {
    const applies = await JobApplyService.getAllJobApplies();
    ctx.body = { applies };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const approveJobApply = async (ctx: Context) => {
  const { id } = ctx.params;
  const { remark } = ctx.request.body as any;
  const approveUserId = ctx.state?.user.id;

  if (!approveUserId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized: User ID not found" };
    return;
  }

  try {
    const apply = await JobApplyService.approveJobApply(
      parseInt(id, 10),
      approveUserId,
      remark
    );
    ctx.body = {
      message: "Job application approved successfully",
      apply
    };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const rejectJobApply = async (ctx: Context) => {
  const { id } = ctx.params;
  const { remark } = ctx.request.body as any;
  const approveUserId = ctx.state?.user.id;

  if (!approveUserId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized: User ID not found" };
    return;
  }

  try {
    const apply = await JobApplyService.rejectJobApply(
      parseInt(id, 10),
      approveUserId,
      remark
    );
    ctx.body = {
      message: "Job application rejected successfully",
      apply
    };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};