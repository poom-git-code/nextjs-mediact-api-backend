import { Context } from "koa";
import * as ScheduleMasterService from "../services/scheduleMasterService";
import {
  createScheduleMasterSchema,
  updateScheduleMasterSchema,
} from "../validations/scheduleMasterValidation";
import Joi from "joi/lib";

export const createScheduleMaster = async (ctx: Context) => {
  // const { error, value } = createScheduleMasterSchema.validate(
  //   ctx.request.body
  // );
  // if (error) {
  //   ctx.status = 400;
  //   ctx.body = { error: error.details[0].message };
  //   return;
  // }

  try {
    const schedule = await ScheduleMasterService.createScheduleMaster(ctx.request.body);
    ctx.body = { message: "Schedule Master created successfully", schedule };
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

export const updateScheduleMaster = async (ctx: Context) => {
  const { id } = ctx.params;
  const { error, value } = updateScheduleMasterSchema.validate(
    ctx.request.body
  );
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const updatedSchedule = await ScheduleMasterService.updateScheduleMaster(
      parseInt(id, 10),
      value
    );
    ctx.body = {
      message: "Schedule Master updated successfully",
      updatedSchedule,
    };
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

export const deleteScheduleMaster = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    await ScheduleMasterService.deleteScheduleMaster(parseInt(id, 10));
    ctx.body = { message: "Schedule Master deleted successfully" };
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

export const getScheduleMasterById = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    const schedule = await ScheduleMasterService.getScheduleMasterById(
      parseInt(id, 10)
    );
    ctx.body = { schedule };
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

export const getAllScheduleMasters = async (ctx: Context) => {
  try {
    const schedules = await ScheduleMasterService.getAllScheduleMasters();
    ctx.body = { schedules };
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

export const getScheduleMastersByMonthYearDepartment = async (ctx: Context) => {
  try {
    const { month, year, department_id } = ctx.query;

    // Validate required query parameters
    if (!month || !year || !department_id) {
      ctx.status = 400;
      ctx.body = { 
        error: "Missing required query parameters: month, year, and department_id are required" 
      };
      return;
    }

    const monthNum = parseInt(month as string, 10);
    const yearNum = parseInt(year as string, 10);
    const departmentIdNum = parseInt(department_id as string, 10);

    // Validate parameter values
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      ctx.status = 400;
      ctx.body = { error: "Month must be a number between 1 and 12" };
      return;
    }

    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      ctx.status = 400;
      ctx.body = { error: "Year must be a valid year between 2000 and 2100" };
      return;
    }

    if (isNaN(departmentIdNum) || departmentIdNum <= 0) {
      ctx.status = 400;
      ctx.body = { error: "Department ID must be a positive number" };
      return;
    }

    const schedules = await ScheduleMasterService.getScheduleMastersByMonthYearDepartment(
      monthNum,
      yearNum,
      departmentIdNum
    );

    ctx.body = { 
      schedules,
      query: {
        month: monthNum,
        year: yearNum,
        department_id: departmentIdNum
      }
    };
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
