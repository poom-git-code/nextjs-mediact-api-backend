import { Context } from "koa";
import * as DepartmentTypeService from "../services/departmentTypeService";
import {
  createDepartmentTypeSchema,
  updateDepartmentTypeSchema,
} from "../validations/departmentTypeValidation";
import Joi from "joi/lib";

export const createDepartmentType = async (ctx: Context) => {
  const data = ctx.request.body;

  const { error, value } = createDepartmentTypeSchema.validate(data);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const departmentType = await DepartmentTypeService.createDepartmentType(
      value
    );
    ctx.body = {
      message: "Department Type created successfully",
      departmentType,
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

export const updateDepartmentType = async (ctx: Context) => {
  const { id } = ctx.params;
  const updates = ctx.request.body;

  const { error, value } = updateDepartmentTypeSchema.validate(updates);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const updatedDepartmentType =
      await DepartmentTypeService.updateDepartmentType(parseInt(id, 10), value);
    ctx.body = {
      message: "Department Type updated successfully",
      updatedDepartmentType,
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

export const deleteDepartmentType = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    await DepartmentTypeService.deleteDepartmentType(parseInt(id, 10));
    ctx.body = { message: "Department Type deleted successfully" };
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

export const getDepartmentTypeById = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    const departmentType = await DepartmentTypeService.getDepartmentTypeById(
      parseInt(id, 10)
    );
    ctx.body = { departmentType };
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

export const getAllDepartmentTypes = async (ctx: Context) => {
  try {
    const departmentTypes = await DepartmentTypeService.getAllDepartmentTypes();
    ctx.body = { departmentTypes };
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
