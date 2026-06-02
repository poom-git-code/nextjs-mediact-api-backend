import { Context } from "koa";
import * as ScheduleShiftLogTypesService from "../services/scheduleShiftLogTypesService";
import Joi from "joi";

// Validation schemas
const createScheduleShiftLogTypeSchema = Joi.object({
  name: Joi.string().max(50).required().messages({
    "string.base": "Name must be a string.",
    "string.max": "Name must not exceed 50 characters.",
    "any.required": "Name is required.",
  }),
  description: Joi.string().max(255).optional().messages({
    "string.base": "Description must be a string.",
    "string.max": "Description must not exceed 255 characters.",
  }),
});

const updateScheduleShiftLogTypeSchema = Joi.object({
  name: Joi.string().max(50).optional().messages({
    "string.base": "Name must be a string.",
    "string.max": "Name must not exceed 50 characters.",
  }),
  description: Joi.string().max(255).optional().messages({
    "string.base": "Description must be a string.",
    "string.max": "Description must not exceed 255 characters.",
  }),
});

// Create schedule shift log type
export const createScheduleShiftLogType = async (ctx: Context) => {
  const { error, value } = createScheduleShiftLogTypeSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const logType = await ScheduleShiftLogTypesService.createScheduleShiftLogType(value);
    ctx.status = 201;
    ctx.body = { message: "Schedule shift log type created successfully", logType };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

// Update schedule shift log type
export const updateScheduleShiftLogType = async (ctx: Context) => {
  const { id } = ctx.params;
  const { error, value } = updateScheduleShiftLogTypeSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const updatedLogType = await ScheduleShiftLogTypesService.updateScheduleShiftLogType(
      parseInt(id, 10),
      value
    );
    ctx.body = { message: "Schedule shift log type updated successfully", logType: updatedLogType };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

// Delete schedule shift log type
export const deleteScheduleShiftLogType = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    await ScheduleShiftLogTypesService.deleteScheduleShiftLogType(parseInt(id, 10));
    ctx.body = { message: "Schedule shift log type deleted successfully" };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

// Get schedule shift log type by ID
export const getScheduleShiftLogTypeById = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    const logType = await ScheduleShiftLogTypesService.getScheduleShiftLogTypeById(parseInt(id, 10));
    ctx.body = { logType };
  } catch (error) {
    ctx.status = 404;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

// Get all schedule shift log types
export const getAllScheduleShiftLogTypes = async (ctx: Context) => {
  try {
    const logTypes = await ScheduleShiftLogTypesService.getAllScheduleShiftLogTypes();
    ctx.body = { logTypes };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

// Get log type by name
export const getScheduleShiftLogTypeByName = async (ctx: Context) => {
  const { name } = ctx.params;

  try {
    const logType = await ScheduleShiftLogTypesService.getScheduleShiftLogTypeByName(name);
    if (!logType) {
      ctx.status = 404;
      ctx.body = { error: "Schedule shift log type not found" };
      return;
    }
    ctx.body = { logType };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

// Initialize default log types
export const initializeDefaultLogTypes = async (ctx: Context) => {
  try {
    const createdTypes = await ScheduleShiftLogTypesService.initializeDefaultLogTypes();
    ctx.body = { 
      message: "Default log types initialized successfully", 
      createdTypes: createdTypes.length,
      types: createdTypes 
    };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};
