import { Context } from "koa";
import * as ScheduleShiftService from "../services/scheduleShiftService";
import {
  createScheduleShiftSchema,
  updateScheduleShiftSchema,
} from "../validations/scheduleShiftValidation";
import Joi from "joi/lib";

export const createScheduleShift = async (ctx: Context) => {
  // const { error, value } = createScheduleShiftSchema.validate(ctx.request.body);
  // if (error) {
  //   ctx.status = 400;
  //   ctx.body = { error: error.details[0].message };
  //   return;
  // }

  try {
    const shift = await ScheduleShiftService.createScheduleShift(ctx.request.body);
    ctx.body = { message: "Schedule Shift created successfully", shift };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const updateScheduleShift = async (ctx: Context) => {
  const { id } = ctx.params;
  // const { error, value } = updateScheduleShiftSchema.validate(ctx.request.body);
  // if (error) {
  //   ctx.status = 400;
  //   ctx.body = { error: error.details[0].message };
  //   return;
  // }

  try {
    const updatedShift = await ScheduleShiftService.updateScheduleShift(
      parseInt(id, 10),
      ctx.request.body
    );
    ctx.body = { message: "Schedule Shift updated successfully", updatedShift };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const deleteScheduleShift = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    await ScheduleShiftService.deleteScheduleShift(parseInt(id, 10));
    ctx.body = { message: "Schedule Shift deleted successfully" };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const getScheduleShiftById = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    const shift = await ScheduleShiftService.getScheduleShiftById(
      parseInt(id, 10)
    );
    ctx.body = { shift };
  } catch (error) {
    ctx.status = 404;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const getScheduleShiftByFacility = async (ctx: Context) => {
  const userId = ctx.state.user.id;

  try {
    const shifts = await ScheduleShiftService.getScheduleShiftByFacility(
      parseInt(userId, 10)
    );
    ctx.body = { shifts };
  } catch (error) {
    ctx.status = 404;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const getAllScheduleShifts = async (ctx: Context) => {
  try {
    console.log("Fetching all schedule shifts");
    const shifts = await ScheduleShiftService.getAllScheduleShifts();
    ctx.body = { shifts };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const getAllScheduleShiftsByScheduleMasterId = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    console.log("Fetching all schedule shifts for schedule master", id);
    const shifts = await ScheduleShiftService.getAllScheduleShiftsByScheduleMasterId(parseInt(id, 10));
    ctx.body = { shifts };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const getSchedulesByUser = async (ctx: Context) => {
  try {
    
    const userId = ctx.state.user?.id;

    if (!userId) {
      ctx.status = 401;
      ctx.body = { error: "Unauthorized: User ID not found in token" };
      return;
    }

    const schedules = await ScheduleShiftService.getSchedulesByUserId(userId);
    ctx.body = { schedules };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const getSchedulesByDate = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    const { date } = ctx.request.body as { date: string };

    if (!userId) {
      ctx.status = 401;
      ctx.body = { error: "Unauthorized: User ID not found in token" };
      return;
    }

    if (!date) {
      ctx.status = 400;
      ctx.body = { error: "Date is required" };
      return;
    }

    const schedules = await ScheduleShiftService.getSchedulesByDate(userId, date);
    ctx.body = { schedules };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const getSchedulesByUserIdAndDate = async (ctx: Context) => {
  try {
    const { user_id, date } = ctx.request.body as { user_id: number; date: string };

    if (!user_id) {
      ctx.status = 400;
      ctx.body = { error: "user_id is required" };
      return;
    }

    if (!date) {
      ctx.status = 400;
      ctx.body = { error: "date is required" };
      return;
    }

    const schedules = await ScheduleShiftService.getSchedulesByUserIdAndDate(user_id, date);
    ctx.body = { schedules };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const getSchedulesByUserIdAndDateForTransferShift = async (ctx: Context) => {
  try {
    const user_id = ctx.state.user?.id;
    const { date } = ctx.request.body as { date: string };

    if (!user_id) {
      ctx.status = 400;
      ctx.body = { error: "user_id is required" };
      return;
    }

    if (!date) {
      ctx.status = 400;
      ctx.body = { error: "date is required" };
      return;
    }

    const schedules = await ScheduleShiftService.getSchedulesByUserIdAndDateForTransferShift(user_id, date);
    
    ctx.body = { schedules };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const getSchedulesByUserPerWeek = async (ctx: Context) => {
  try {
    
    const userId = ctx.state.user?.id;

    if (!userId) {
      ctx.status = 401;
      ctx.body = { error: "Unauthorized: User ID not found in token" };
      return;
    }

    const schedules = await ScheduleShiftService.getSchedulesByUserIdPerWeek(userId);
    ctx.body = { schedules };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const getSchedulesByUserOnDepartment = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;

    if (!userId) {
      ctx.status = 401;
      ctx.body = { error: "Unauthorized: User ID not found in token" };
      return;
    }

    const result = await ScheduleShiftService.getSchedulesByUserIdOnDepartment(userId);
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

export const getGroupedScheduleShifts = async (ctx: Context) => {
  const userId = ctx.state.user?.id

  try {
    const groupedShifts = await ScheduleShiftService.getGroupedScheduleShiftsByFacilitySQL(
      parseInt(userId, 10)
    )

    ctx.status = 200
    ctx.body = { groupedShifts }
  } catch (error) {
    ctx.status = 404

    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.status = 500
      ctx.body = { error: "An unknown error occurred" };
    }
  }
}