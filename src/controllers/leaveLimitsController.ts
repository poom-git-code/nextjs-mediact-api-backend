import { Context } from "koa";
import * as LeaveLimitsService from "../services/leaveLimitsService";

export const getAllLeaveLimits = async (ctx: Context) => {
  try {
    const leaveLimits = await LeaveLimitsService.getAllLeaveLimits();
    ctx.status = 200;
    ctx.body = {
      status: "success",
      data: leaveLimits,
    };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      status: "error",
      message: error.message,
    };
  }
};

export const getLeaveLimitById = async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id, 10);
    
    if (isNaN(id)) {
      ctx.status = 400;
      ctx.body = {
        status: "error",
        message: "Invalid leave limit ID",
      };
      return;
    }

    const leaveLimit = await LeaveLimitsService.getLeaveLimitById(id);
    ctx.status = 200;
    ctx.body = {
      status: "success",
      data: leaveLimit,
    };
  } catch (error: any) {
    if (error.message === "Leave limit not found") {
      ctx.status = 404;
      ctx.body = {
        status: "error",
        message: error.message,
      };
    } else {
      ctx.status = 500;
      ctx.body = {
        status: "error",
        message: error.message,
      };
    }
  }
};

export const getLeaveLimitsByFacility = async (ctx: Context) => {
  try {
    const facilityId = parseInt(ctx.params.facilityId, 10);
    
    if (isNaN(facilityId)) {
      ctx.status = 400;
      ctx.body = {
        status: "error",
        message: "Invalid facility ID",
      };
      return;
    }

    const leaveLimits = await LeaveLimitsService.getLeaveLimitsByFacility(facilityId);
    ctx.status = 200;
    ctx.body = {
      status: "success",
      data: leaveLimits,
    };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      status: "error",
      message: error.message,
    };
  }
};

export const getLeaveLimitsByLeaveType = async (ctx: Context) => {
  try {
    const leaveTypeId = parseInt(ctx.params.leaveTypeId, 10);
    
    if (isNaN(leaveTypeId)) {
      ctx.status = 400;
      ctx.body = {
        status: "error",
        message: "Invalid leave type ID",
      };
      return;
    }

    const leaveLimits = await LeaveLimitsService.getLeaveLimitsByLeaveType(leaveTypeId);
    ctx.status = 200;
    ctx.body = {
      status: "success",
      data: leaveLimits,
    };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      status: "error",
      message: error.message,
    };
  }
};

export const getLeaveLimitByFacilityAndType = async (ctx: Context) => {
  try {
    const facilityId = parseInt(ctx.params.facilityId, 10);
    const leaveTypeId = parseInt(ctx.params.leaveTypeId, 10);
    
    if (isNaN(facilityId) || isNaN(leaveTypeId)) {
      ctx.status = 400;
      ctx.body = {
        status: "error",
        message: "Invalid facility ID or leave type ID",
      };
      return;
    }

    const leaveLimit = await LeaveLimitsService.getLeaveLimitByFacilityAndType(facilityId, leaveTypeId);
    
    if (!leaveLimit) {
      ctx.status = 404;
      ctx.body = {
        status: "error",
        message: "Leave limit not found for this facility and leave type",
      };
      return;
    }

    ctx.status = 200;
    ctx.body = {
      status: "success",
      data: leaveLimit,
    };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      status: "error",
      message: error.message,
    };
  }
};

export const createLeaveLimit = async (ctx: Context) => {
  try {
    const { facility_id, leave_type_id, max_days } = ctx.request.body as any;
    const userId = (ctx.state.user?.id) ? parseInt(ctx.state.user.id, 10) : undefined;

    // Validation
    if (!facility_id || !leave_type_id || max_days === undefined) {
      ctx.status = 400;
      ctx.body = {
        status: "error",
        message: "facility_id, leave_type_id, and max_days are required",
      };
      return;
    }

    const facilityIdNum = parseInt(facility_id, 10);
    const leaveTypeIdNum = parseInt(leave_type_id, 10);
    const maxDaysNum = parseInt(max_days, 10);

    if (isNaN(facilityIdNum) || isNaN(leaveTypeIdNum) || isNaN(maxDaysNum)) {
      ctx.status = 400;
      ctx.body = {
        status: "error",
        message: "facility_id, leave_type_id, and max_days must be valid numbers",
      };
      return;
    }

    if (maxDaysNum < 0) {
      ctx.status = 400;
      ctx.body = {
        status: "error",
        message: "max_days must be a positive number",
      };
      return;
    }

    const leaveLimit = await LeaveLimitsService.createLeaveLimit(
      facilityIdNum,
      leaveTypeIdNum,
      maxDaysNum,
      userId
    );

    ctx.status = 201;
    ctx.body = {
      status: "success",
      message: "Leave limit created successfully",
      data: leaveLimit,
    };
  } catch (error: any) {
    if (error.message.includes("already exists")) {
      ctx.status = 409;
      ctx.body = {
        status: "error",
        message: error.message,
      };
    } else {
      ctx.status = 500;
      ctx.body = {
        status: "error",
        message: error.message,
      };
    }
  }
};

export const updateLeaveLimit = async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id, 10);
    const updateData = ctx.request.body as any;
    const userId = (ctx.state.user?.id) ? parseInt(ctx.state.user.id, 10) : undefined;

    if (isNaN(id)) {
      ctx.status = 400;
      ctx.body = {
        status: "error",
        message: "Invalid leave limit ID",
      };
      return;
    }

    // Validate numeric fields if provided
    if (updateData.facility_id !== undefined) {
      const facilityId = parseInt(updateData.facility_id, 10);
      if (isNaN(facilityId)) {
        ctx.status = 400;
        ctx.body = {
          status: "error",
          message: "facility_id must be a valid number",
        };
        return;
      }
      updateData.facility_id = facilityId;
    }

    if (updateData.leave_type_id !== undefined) {
      const leaveTypeId = parseInt(updateData.leave_type_id, 10);
      if (isNaN(leaveTypeId)) {
        ctx.status = 400;
        ctx.body = {
          status: "error",
          message: "leave_type_id must be a valid number",
        };
        return;
      }
      updateData.leave_type_id = leaveTypeId;
    }

    if (updateData.max_days !== undefined) {
      const maxDays = parseInt(updateData.max_days, 10);
      if (isNaN(maxDays) || maxDays < 0) {
        ctx.status = 400;
        ctx.body = {
          status: "error",
          message: "max_days must be a valid positive number",
        };
        return;
      }
      updateData.max_days = maxDays;
    }

    // Add updated_by
    if (userId) {
      updateData.updated_by = userId;
    }

    const updatedLeaveLimit = await LeaveLimitsService.updateLeaveLimit(id, updateData);

    ctx.status = 200;
    ctx.body = {
      status: "success",
      message: "Leave limit updated successfully",
      data: updatedLeaveLimit,
    };
  } catch (error: any) {
    if (error.message === "Leave limit not found") {
      ctx.status = 404;
      ctx.body = {
        status: "error",
        message: error.message,
      };
    } else if (error.message.includes("already exists")) {
      ctx.status = 409;
      ctx.body = {
        status: "error",
        message: error.message,
      };
    } else {
      ctx.status = 500;
      ctx.body = {
        status: "error",
        message: error.message,
      };
    }
  }
};

export const deleteLeaveLimit = async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id, 10);

    if (isNaN(id)) {
      ctx.status = 400;
      ctx.body = {
        status: "error",
        message: "Invalid leave limit ID",
      };
      return;
    }

    const result = await LeaveLimitsService.deleteLeaveLimit(id);

    ctx.status = 200;
    ctx.body = {
      status: "success",
      ...result,
    };
  } catch (error: any) {
    if (error.message === "Leave limit not found") {
      ctx.status = 404;
      ctx.body = {
        status: "error",
        message: error.message,
      };
    } else {
      ctx.status = 500;
      ctx.body = {
        status: "error",
        message: error.message,
      };
    }
  }
};
