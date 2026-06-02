import { Context } from "koa";
import * as ScheduleTemplateService from "../services/scheduleTemplateService";
import * as ScheduleMasterService from "../services/scheduleMasterService";
import {
  createScheduleMasterSchema,
  updateScheduleMasterSchema,
} from "../validations/scheduleMasterValidation";
import Joi from "joi/lib";

export const createScheduleMaster = async (ctx: Context) => {
  const { error, value } = createScheduleMasterSchema.validate(
    ctx.request.body
  );
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const schedule = await ScheduleTemplateService.createScheduleTemplate(value);
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
