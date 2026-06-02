import { Context } from "koa";
import * as ScheduleShiftLogsService from "../services/scheduleShiftLogsService";
import { createScheduleShiftLogSchema, updateScheduleShiftLogSchema } from "../validations/scheduleShiftLogsValidation";

// Create schedule shift log
export const createScheduleShiftLog = async (ctx: Context) => {
  const user_id = ctx.state.user?.id;
  if (!user_id) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized" };
    return;
  }
  
  const { error, value } = createScheduleShiftLogSchema.validate({
    ...ctx.request.body,
    user_id,
  });
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const log = await ScheduleShiftLogsService.createScheduleShiftLog(value);
    ctx.status = 201;
    ctx.body = { message: "Schedule shift log created successfully", log };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: error instanceof Error ? error.message : "Unknown error occurred" };
  }
};

// not test yet
// Update schedule shift log
export const updateScheduleShiftLog = async (ctx: Context) => {
  const { id } = ctx.params;
  const { error, value } = updateScheduleShiftLogSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const updatedLog = await ScheduleShiftLogsService.updateScheduleShiftLog(
      parseInt(id, 10),
      value
    );
    ctx.body = { message: "Schedule shift log updated successfully", log: updatedLog };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

// not test yet
// Delete schedule shift log
export const deleteScheduleShiftLog = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    await ScheduleShiftLogsService.deleteScheduleShiftLog(parseInt(id, 10));
    ctx.body = { message: "Schedule shift log deleted successfully" };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

// not test yet
// Get schedule shift log by ID
export const getScheduleShiftLogById = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    const log = await ScheduleShiftLogsService.getScheduleShiftLogById(parseInt(id, 10));
    ctx.body = { log };
  } catch (error) {
    ctx.status = 404;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

// not test yet
// Get all schedule shift logs
export const getAllScheduleShiftLogs = async (ctx: Context) => {
  try {
    // const page = parseInt(ctx.query.page as string) || 1;
    // const limit = parseInt(ctx.query.limit as string) || 10;
    const schedule_shift_id = ctx.query.schedule_shift_id ? parseInt(ctx.query.schedule_shift_id as string) : undefined;
    const user_id = ctx.query.user_id ? parseInt(ctx.query.user_id as string) : undefined;
    const log_type_id = ctx.query.log_type_id ? parseInt(ctx.query.log_type_id as string) : undefined;
    const start_date = ctx.query.start_date as string;
    const end_date = ctx.query.end_date as string;

    const result = await ScheduleShiftLogsService.getAllScheduleShiftLogs({
    //   page,
    //   limit,
      schedule_shift_id,
      user_id,
      log_type_id,
      start_date,
      end_date,
    });

    ctx.body = result;
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

// not test yet
// Get logs by schedule shift ID
export const getLogsByScheduleShiftId = async (ctx: Context) => {
  const { schedule_shift_id } = ctx.params;

  try {
    const logs = await ScheduleShiftLogsService.getLogsByScheduleShiftId(parseInt(schedule_shift_id, 10));
    ctx.body = { logs };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

// not test yet
// Get logs by user ID
export const getLogsByUserId = async (ctx: Context) => {
  // user_id from token
  const user_id = ctx.state.user.id;
  console.log("User ID:", user_id);
  if (!user_id) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized" };
    return;
  }

  // Optional filters
  const start_date = ctx.query.start_date ? String(ctx.query.start_date) : undefined;
  const end_date = ctx.query.end_date ? String(ctx.query.end_date) : undefined;
  const log_type_id = ctx.query.log_type_id ? parseInt(ctx.query.log_type_id as string) : undefined;

  try {
    const logs = await ScheduleShiftLogsService.getLogsByUserId(parseInt(user_id, 10), {
      ...(start_date && { start_date }),
      ...(end_date && { end_date }),
      ...(log_type_id && { log_type_id }),
    });
    ctx.body = { logs };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

// not test yet
// Get latest log by schedule shift ID
export const getLatestLogByScheduleShiftId = async (ctx: Context) => {
  const { schedule_shift_id } = ctx.params;
  const log_type_id = ctx.query.log_type_id ? parseInt(ctx.query.log_type_id as string) : undefined;

  try {
    const log = await ScheduleShiftLogsService.getLatestLogByScheduleShiftId(
      parseInt(schedule_shift_id, 10),
      log_type_id
    );
    ctx.body = { log };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

// not test yet
// Bulk create logs
export const bulkCreateScheduleShiftLogs = async (ctx: Context) => {
  const { logs } = ctx.request.body;

  if (!Array.isArray(logs)) {
    ctx.status = 400;
    ctx.body = { error: "Logs must be an array" };
    return;
  }

  try {
    // Validate each log entry
    for (const log of logs) {
      const { error } = createScheduleShiftLogSchema.validate(log);
      if (error) {
        ctx.status = 400;
        ctx.body = { error: `Invalid log entry: ${error.details[0].message}` };
        return;
      }
    }

    const createdLogs = await ScheduleShiftLogsService.bulkCreateScheduleShiftLogs(logs);
    ctx.status = 201;
    ctx.body = { message: "Schedule shift logs created successfully", logs: createdLogs };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};
