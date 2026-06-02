import { Context } from "koa";
import * as JobTypeService from "../services/jobTypeService";

// Get all job types
export const getAllJobTypes = async (ctx: Context) => {
  try {
    const filters = {
      is_active: ctx.query.is_active !== undefined ? ctx.query.is_active === 'true' : undefined,
      search: ctx.query.search as string,
    };
    
    const jobTypes = await JobTypeService.getAllJobTypes(filters);
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      data: jobTypes,
      message: "Job types retrieved successfully",
    };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "Internal server error",
      error: error.message,
    };
  }
};

// Get job type by ID
export const getJobTypeById = async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id);
    
    if (isNaN(id)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "Invalid job type ID",
      };
      return;
    }
    
    const jobType = await JobTypeService.getJobTypeById(id);
    
    if (!jobType) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: "Job type not found",
      };
      return;
    }
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      data: jobType,
      message: "Job type retrieved successfully",
    };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "Internal server error",
      error: error.message,
    };
  }
};

// Get job type by code
export const getJobTypeByCode = async (ctx: Context) => {
  try {
    const code = ctx.params.code as string;
    
    if (!code) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "Job type code is required",
      };
      return;
    }
    
    const jobType = await JobTypeService.getJobTypeByCode(code);
    
    if (!jobType) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: "Job type not found",
      };
      return;
    }
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      data: jobType,
      message: "Job type retrieved successfully",
    };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "Internal server error",
      error: error.message,
    };
  }
};

// Create new job type
export const createJobType = async (ctx: Context) => {
  try {
    const { job_type_code, job_type_name_th, job_type_name_en, description, is_active } = ctx.request.body as any;
    
    // Validation
    if (!job_type_code || !job_type_name_th || !job_type_name_en) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "job_type_code, job_type_name_th, and job_type_name_en are required",
      };
      return;
    }
    
    const jobType = await JobTypeService.createJobType({
      job_type_code,
      job_type_name_th,
      job_type_name_en,
      description,
      is_active,
    });
    
    ctx.status = 201;
    ctx.body = {
      success: true,
      data: jobType,
      message: "Job type created successfully",
    };
  } catch (error: any) {
    if (error.message.includes("already exists")) {
      ctx.status = 409;
      ctx.body = {
        success: false,
        message: error.message,
      };
    } else {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: "Internal server error",
        error: error.message,
      };
    }
  }
};

// Update job type
export const updateJobType = async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id);
    
    if (isNaN(id)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "Invalid job type ID",
      };
      return;
    }
    
    const updates = ctx.request.body as any;
    
    const jobType = await JobTypeService.updateJobType(id, updates);
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      data: jobType,
      message: "Job type updated successfully",
    };
  } catch (error: any) {
    if (error.message === "Job type not found") {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: error.message,
      };
    } else if (error.message.includes("already exists")) {
      ctx.status = 409;
      ctx.body = {
        success: false,
        message: error.message,
      };
    } else {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: "Internal server error",
        error: error.message,
      };
    }
  }
};

// Delete job type (soft delete)
export const deleteJobType = async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id);
    
    if (isNaN(id)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "Invalid job type ID",
      };
      return;
    }
    
    const jobType = await JobTypeService.deleteJobType(id);
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      data: jobType,
      message: "Job type deleted successfully",
    };
  } catch (error: any) {
    if (error.message === "Job type not found") {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: error.message,
      };
    } else {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: "Internal server error",
        error: error.message,
      };
    }
  }
};

// Hard delete job type
export const hardDeleteJobType = async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id);
    
    if (isNaN(id)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "Invalid job type ID",
      };
      return;
    }
    
    await JobTypeService.hardDeleteJobType(id);
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      message: "Job type permanently deleted",
    };
  } catch (error: any) {
    if (error.message === "Job type not found") {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: error.message,
      };
    } else {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: "Internal server error",
        error: error.message,
      };
    }
  }
};