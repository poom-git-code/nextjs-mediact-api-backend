import { Context } from "koa";
import * as JobStatusService from "../services/jobStatusService";
import { createJobStatusSchema, updateJobStatusSchema } from "../validations/jobStatusValidation";

export const createJobStatus = async (ctx: Context) => {
  const { error, value } = createJobStatusSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }
  try {
    const status = await JobStatusService.createJobStatus(value);
    ctx.status = 201;
    ctx.body = { message: "Job status created successfully", status };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const updateJobStatus = async (ctx: Context) => {
  const { id } = ctx.params;
  const { error, value } = updateJobStatusSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }
  try {
    const status = await JobStatusService.updateJobStatus(parseInt(id, 10), value);
    ctx.body = { message: "Job status updated successfully", status };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const deleteJobStatus = async (ctx: Context) => {
  const { id } = ctx.params;
  try {
    await JobStatusService.deleteJobStatus(parseInt(id, 10));
    ctx.body = { message: "Job status deleted successfully" };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getJobStatusById = async (ctx: Context) => {
  const { id } = ctx.params;
  try {
    const status = await JobStatusService.getJobStatusById(parseInt(id, 10));
    ctx.body = { status };
  } catch (err: any) {
    ctx.status = 404;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getAllJobStatuses = async (ctx: Context) => {
  try {
    const statuses = await JobStatusService.getAllJobStatuses();
    ctx.body = { statuses };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};