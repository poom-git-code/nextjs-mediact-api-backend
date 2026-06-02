import { Context } from "koa";
import * as JobService from "../services/jobService";
import { createJobSchema, updateJobSchema } from "../validations/jobValidation";

interface JobQueryOptions {
  page?: number;
  limit?: number;
  month?: number;
  year?: number;
  departmentId?: number;
}

export const createJob = async (ctx: Context) => {
  const { error, value } = createJobSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }
  try {
    if (!ctx.state.user) {
      ctx.status = 401;
      ctx.body = { error: "Authentication required" };
      return;
    }

    const { id: userId } = ctx.state.user;

    const job = await JobService.createJobAndNotify(value, userId);

    ctx.status = 201;
    ctx.body = { message: "Job created successfully", job };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const updateJob = async (ctx: Context) => {
  const { id } = ctx.params;
  const jobId = parseInt(id, 10);

  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized" };
    return;
  }

  const { error, value } = updateJobSchema.validate(ctx.request.body);

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  if (isNaN(jobId)) {
    ctx.status = 400;
    ctx.body = { error: "Invalid Job ID" };
    return;
  }

  try {
    const job = await JobService.updateJob(jobId, value, userId);
    ctx.body = { message: "Job updated successfully", job };
  } catch (err: any) {
    if (err.message.includes("Job not found") || err.message.includes("Permission denied")) {
      ctx.status = 404;
      ctx.body = { error: err.message };
    } else {
      ctx.status = 500;
      ctx.body = { error: "An internal error occurred" };
    }
  }
};

export const deleteJob = async (ctx: Context) => {
  const { id } = ctx.params;
  const jobId = parseInt(id, 10);

  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized" };
    return;
  }

  if (isNaN(jobId)) {
    ctx.status = 400;
    ctx.body = { error: "Invalid Job ID" };
    return;
  }

  try {
    await JobService.deleteJob(jobId, userId);
    ctx.body = { message: "Job deleted successfully" };
  } catch (err: any) {
    if (err.message.includes("Job not found") || err.message.includes("Permission denied")) {
      ctx.status = 404;
      ctx.body = { error: err.message };
    } else {
      ctx.status = 500;
      ctx.body = { error: "An internal error occurred" };
    }
  }
};

export const getJobById = async (ctx: Context) => {
  const { id } = ctx.params;
  const jobId = parseInt(id, 10);

  if (isNaN(jobId)) {
    ctx.status = 400;
    ctx.body = { error: "Invalid Job ID format" };
    return;
  }

  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized" };
    return;
  }
  try {
    const job = await JobService.getJobById(jobId, userId);
    ctx.body = { job };
  } catch (err: any) {
    ctx.status = 404;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getJobByIdBackoffice = async (ctx: Context) => {
  const { id } = ctx.params;
  const jobId = parseInt(id, 10);

  if (isNaN(jobId)) {
    ctx.status = 400;
    ctx.body = { error: "Invalid Job ID format" };
    return;
  }
  try {
    const job = await JobService.getJobByIdBackoffice(jobId);
    ctx.body = { job };
  } catch (err: any) {
    ctx.status = 404;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getAllJobs = async (ctx: Context) => {
  try {
    const { page: pageQuery, limit: limitQuery } = ctx.query;

    const page = pageQuery ? parseInt(pageQuery as string, 10) : 1;
    const limit = limitQuery ? parseInt(limitQuery as string, 10) : 25;

    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      ctx.status = 400;
      ctx.body = { error: "Invalid pagination parameters. 'page' and 'limit' must be positive numbers." };
      return;
    }

    const options = { page, limit };

    const responseData = await JobService.getAllJobs(options);

    ctx.body = responseData;

  } catch (err: any) {
    ctx.status = 500;
    ctx.body = { error: err.message || "An internal server error occurred" };
  }
};

export const getAvailableAndAppliedJobs = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    if (!userId) {
      ctx.status = 401;
      ctx.body = { error: "Unauthorized" };
      return;
    }
    const jobs = await JobService.getAvailableAndAppliedJobs(userId);
    ctx.body = { jobs };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getAvailableAndAppliedJobsByPublishGroup = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    if (!userId) {
      ctx.status = 401;
      ctx.body = { error: "Unauthorized" };
      return;
    }
    const jobs = await JobService.getAvailableAndAppliedJobsByPublishGroup(userId);
    ctx.body = { jobs };
  } catch (err: any) {
    ctx.status = 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getAllJobsByFacility = async (ctx: Context) => {
  const { facilityId } = ctx.params;
  const id = parseInt(facilityId, 10);

  if (isNaN(id)) {
    ctx.status = 400;
    ctx.body = { error: "Invalid facility ID" };
    return;
  }

  try {
    const jobs = await JobService.getAllJobsByFacility(
      id
    );
    ctx.body = { jobs };
  } catch (err: any) {
    ctx.status = 500;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const getJobsByUserFacility = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    if (!userId) {
      ctx.status = 401;
      ctx.body = { error: "Unauthorized" };
      return;
    }

    const {
      page: pageQuery,
      limit: limitQuery,
      month: monthQuery,
      year: yearQuery,
      departmentId: departmentIdQuery
    } = ctx.query;

    const page = pageQuery ? parseInt(pageQuery as string, 10) : 1;
    const limit = limitQuery ? parseInt(limitQuery as string, 10) : 25;

    const options: JobQueryOptions = { page, limit };

    if (monthQuery) {
      options.month = parseInt(monthQuery as string, 10);
      if (isNaN(options.month)) { /* คืน 400 Bad Request */ }
    }
    if (yearQuery) {
      options.year = parseInt(yearQuery as string, 10);
      if (isNaN(options.year)) { /* คืน 400 Bad Request */ }
    }
    if (departmentIdQuery) {
      options.departmentId = parseInt(departmentIdQuery as string, 10);
    }

    const responseData = await JobService.getJobsByUserFacility(userId, options);

    ctx.body = responseData;

  } catch (err: any) {
    ctx.status = err.status || 400;
    ctx.body = { error: err.message || "Unknown error" };
  }
};

export const broadcastJob = async (ctx: Context) => {
  try {
    const jobId = parseInt(ctx.params.id, 10);

    const userId = ctx.state.user?.id;
    if (!userId) {
      ctx.status = 401;
      ctx.body = { error: "Unauthorized" };
      return;
    }

    if (isNaN(jobId)) {
      ctx.status = 400;
      ctx.body = { error: "Invalid Job ID" };
      return;
    }

    const result = await JobService.broadcastJobNotification(jobId, userId);

    ctx.status = 200;
    ctx.body = result;
  } catch (err: any) {
    if (err.message.includes("Job not found") || err.message.includes("Permission denied")) {
      ctx.status = 404;
      ctx.body = { error: err.message };
    } else {
      ctx.status = 500;
      ctx.body = { error: "An internal error occurred" };
    }
  }
}

export const updateAndBroadcast = async (ctx: Context) => {
  try {
    const jobId = parseInt(ctx.params.id, 10);

    const userId = ctx.state.user?.id;
    if (!userId) {
      ctx.status = 401;
      ctx.body = { error: "Unauthorized" };
      return;
    }

    if (isNaN(jobId)) {
      ctx.status = 400;
      ctx.body = { error: "Invalid Job ID" };
      return;
    }

    const { error, value } = updateJobSchema.validate(ctx.request.body);
    if (error) {
      ctx.status = 400;
      ctx.body = { error: error.details[0].message };
      return;
    }

    const result = await JobService.updateAndBroadcastJob(jobId, value, userId);

    ctx.status = 200;
    ctx.body = result;
  } catch (err: any) {
    if (err.message.includes("Job not found") || err.message.includes("Permission denied")) {
      ctx.status = 404;
      ctx.body = { error: err.message };
    } else {
      ctx.status = 500;
      ctx.body = { error: "An internal error occurred" };
    }
  }
};

/**
 * Controller สำหรับนับจำนวน Job ที่ยัง Pending
 * รับ query params: department_id, year, month
 */
export const getPendingApplicantsByDepartment = async (ctx: Context) => {
  try {
    const { department_id, year, month } = ctx.query;

    if (!department_id || !year || !month) {
      ctx.status = 400;
      ctx.body = { message: "Missing required query parameters: department_id, year, month" };
      return;
    }

    const deptIdNum = parseInt(department_id as string, 10);
    const yearNum = parseInt(year as string, 10);
    const monthNum = parseInt(month as string, 10);

    if (isNaN(deptIdNum) || isNaN(yearNum) || isNaN(monthNum)) {
      ctx.status = 400;
      ctx.body = { message: "Invalid input: department_id, year, and month must be numbers." };
      return;
    }

    const count = await JobService.countPendingApplicantsByDepartment(
      deptIdNum,
      yearNum,
      monthNum
    );

    ctx.status = 200;
    ctx.body = { count: count };

  } catch (err: any) {
    console.error("Error in getPendingApplicantsByDepartment controller:", err);
    ctx.status = err.status || 500;
    ctx.body = { message: err.message || "Internal server error" };
  }
};