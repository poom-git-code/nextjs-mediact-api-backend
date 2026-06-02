import { Context } from "koa";
import * as ScheduleTemplateShiftService from "../services/scheduleTemplateShiftService";
import {
  createScheduleTemplateShiftSchema,
  updateScheduleTemplateShiftSchema,
} from "../validations/scheduleTemplateShiftValidation";
import Joi from "joi/lib";

export const createScheduleTemplateShift = async (ctx: Context) => {
  const { error, value } = createScheduleTemplateShiftSchema.validate(
    ctx.request.body
  );
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const shift =
      await ScheduleTemplateShiftService.createScheduleTemplateShift(value);
    ctx.body = {
      message: "Schedule Template Shift created successfully",
      shift,
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

export const updateScheduleTemplateShift = async (ctx: Context) => {
  const { id } = ctx.params;
  const { error, value } = updateScheduleTemplateShiftSchema.validate(
    ctx.request.body
  );
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const updatedShift =
      await ScheduleTemplateShiftService.updateScheduleTemplateShift(
        parseInt(id, 10),
        value
      );
    ctx.body = {
      message: "Schedule Template Shift updated successfully",
      updatedShift,
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

export const deleteScheduleTemplateShift = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    await ScheduleTemplateShiftService.deleteScheduleTemplateShift(
      parseInt(id, 10)
    );
    ctx.body = { message: "Schedule Template Shift deleted successfully" };
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

export const getScheduleTemplateShiftById = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    const shift =
      await ScheduleTemplateShiftService.getScheduleTemplateShiftById(
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

export const getAllScheduleTemplateShifts = async (ctx: Context) => {
  try {
    const shifts =
      await ScheduleTemplateShiftService.getAllScheduleTemplateShifts();
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
