import { Context } from "koa";
import * as DepartmentOperatingHoursService from "../services/departmentOperatingHoursService";
import { createDepartmentOperatingHoursSchema, updateDepartmentOperatingHoursSchema } from "../validations/departmentOperatingHoursValidation";
import Joi from "joi";

export const createDepartmentOperatingHours = async (ctx: Context) => {
  const { error } = createDepartmentOperatingHoursSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const userId = ctx.state.user?.id;
    const departmentOperatingHours = await DepartmentOperatingHoursService.createDepartmentOperatingHours(ctx.request.body, userId);
    ctx.status = 201;
    ctx.body = { message: "Department operating hours created successfully", departmentOperatingHours };
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

export const updateDepartmentOperatingHours = async (ctx: Context) => {
  const { id } = ctx.params;
  const { error, value } = updateDepartmentOperatingHoursSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const userId = ctx.state.user?.id;
    const updatedDepartmentOperatingHours = await DepartmentOperatingHoursService.updateDepartmentOperatingHours(
      parseInt(id, 10),
      value,
      userId
    );
    ctx.body = { message: "Department operating hours updated successfully", departmentOperatingHours: updatedDepartmentOperatingHours };
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

export const deleteDepartmentOperatingHours = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    await DepartmentOperatingHoursService.deleteDepartmentOperatingHours(parseInt(ctx.params.id), userId);
    ctx.body = { message: "Department operating hours deactivated successfully" };
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

export const getDepartmentOperatingHoursById = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    const departmentOperatingHours = await DepartmentOperatingHoursService.getDepartmentOperatingHoursById(parseInt(id, 10));
    ctx.body = { departmentOperatingHours };
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

export const getAllDepartmentOperatingHours = async (ctx: Context) => {
  try {
    const filters = ctx.query;
    const departmentOperatingHours = await DepartmentOperatingHoursService.getAllDepartmentOperatingHours(filters);
    ctx.body = { departmentOperatingHours };
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

export const getDepartmentOperatingHoursByDepartment = async (ctx: Context) => {
  const { departmentId } = ctx.params;

  try {
    const departmentOperatingHours = await DepartmentOperatingHoursService.getDepartmentOperatingHoursByDepartment(parseInt(departmentId, 10));
    ctx.body = { departmentOperatingHours };
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

export const getDepartmentOperatingHoursByWeekday = async (ctx: Context) => {
  const { weekday } = ctx.params;

  try {
    const departmentOperatingHours = await DepartmentOperatingHoursService.getDepartmentOperatingHoursByWeekday(weekday);
    ctx.body = { departmentOperatingHours };
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
