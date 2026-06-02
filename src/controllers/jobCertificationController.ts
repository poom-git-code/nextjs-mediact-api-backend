import { Context } from "koa";
import * as JobCertificationService from "../services/jobCertificationService";
import { createJobCertificationSchema, updateJobCertificationSchema } from "../validations/jobCertificationValidation";

export const createJobCertification = async (ctx: Context) => {
  const { error, value } = createJobCertificationSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }
  try {
    const cert = await JobCertificationService.createJobCertification(value);
    ctx.status = 201;
    ctx.body = { message: "Job certification created successfully", cert };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const updateJobCertification = async (ctx: Context) => {
  const { id } = ctx.params;
  const { error, value } = updateJobCertificationSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }
  try {
    const cert = await JobCertificationService.updateJobCertification(parseInt(id, 10), value);
    ctx.body = { message: "Job certification updated successfully", cert };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const deleteJobCertification = async (ctx: Context) => {
  const { id } = ctx.params;
  try {
    await JobCertificationService.deleteJobCertification(parseInt(id, 10));
    ctx.body = { message: "Job certification deleted successfully" };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getJobCertificationById = async (ctx: Context) => {
  const { id } = ctx.params;
  try {
    const cert = await JobCertificationService.getJobCertificationById(parseInt(id, 10));
    ctx.body = { cert };
  } catch (err: any) {
    ctx.status = 404;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getAllJobCertifications = async (ctx: Context) => {
  try {
    const certs = await JobCertificationService.getAllJobCertifications();
    ctx.body = { certs };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};