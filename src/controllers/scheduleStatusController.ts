import { Context } from "koa";
import * as ScheduleStatusService from "../services/scheduleStatusService";
import {
  createScheduleStatusSchema,
  updateScheduleStatusSchema,
} from "../validations/scheduleStatusValidation";
import Joi from "joi/lib";

export const createScheduleStatus = async (ctx: Context) => {
  const { error, value } = createScheduleStatusSchema.validate(
    ctx.request.body
  );
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const status = await ScheduleStatusService.createScheduleStatus(value);
    ctx.body = { message: "Schedule Status created successfully", status };
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

export const updateScheduleStatus = async (ctx: Context) => {
  const { id } = ctx.params;
  const { error, value } = updateScheduleStatusSchema.validate(
    ctx.request.body
  );
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const updatedStatus = await ScheduleStatusService.updateScheduleStatus(
      parseInt(id, 10),
      value
    );
    ctx.body = {
      message: "Schedule Status updated successfully",
      updatedStatus,
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

export const deleteScheduleStatus = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    await ScheduleStatusService.deleteScheduleStatus(parseInt(id, 10));
    ctx.body = { message: "Schedule Status deleted successfully" };
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

export const getScheduleStatusById = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    const status = await ScheduleStatusService.getScheduleStatusById(
      parseInt(id, 10)
    );
    ctx.body = { status };
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

export const getAllScheduleStatuses = async (ctx: Context) => {
  try {
    const statuses = await ScheduleStatusService.getAllScheduleStatuses();
    ctx.body = { statuses };
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
