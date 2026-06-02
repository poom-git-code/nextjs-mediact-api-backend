import { Context } from "koa";
import * as DepartmentSupervisorService from "../services/departmentSupervisorService";
import { createDepartmentSupervisorSchema, updateDepartmentSupervisorSchema } from "../validations/departmentSupervisorValidation";
import Joi from "joi";

export const createDepartmentSupervisor = async (ctx: Context) => {
  const { error } = createDepartmentSupervisorSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const userId = ctx.state.user?.id;
    const departmentSupervisor = await DepartmentSupervisorService.createDepartmentSupervisor(ctx.request.body, userId);
    ctx.status = 201;
    ctx.body = { message: "Department supervisor created successfully", departmentSupervisor };
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

export const updateDepartmentSupervisor = async (ctx: Context) => {
  const { id } = ctx.params;
  const { error, value } = updateDepartmentSupervisorSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const userId = ctx.state.user?.id;
    const updatedDepartmentSupervisor = await DepartmentSupervisorService.updateDepartmentSupervisor(
      parseInt(id, 10),
      value,
      userId
    );
    ctx.body = { message: "Department supervisor updated successfully", departmentSupervisor: updatedDepartmentSupervisor };
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

export const deleteDepartmentSupervisor = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    await DepartmentSupervisorService.deleteDepartmentSupervisor(parseInt(ctx.params.id), userId);
    ctx.body = { message: "Department supervisor deactivated successfully" };
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

export const getDepartmentSupervisorById = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    const departmentSupervisor = await DepartmentSupervisorService.getDepartmentSupervisorById(parseInt(id, 10));
    ctx.body = { departmentSupervisor };
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

export const getAllDepartmentSupervisors = async (ctx: Context) => {
  try {
    const filters = ctx.query;
    const departmentSupervisors = await DepartmentSupervisorService.getAllDepartmentSupervisors(filters);
    ctx.body = { departmentSupervisors };
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

export const getDepartmentSupervisorsByDepartment = async (ctx: Context) => {
  const { departmentId } = ctx.params;

  try {
    const departmentSupervisors = await DepartmentSupervisorService.getDepartmentSupervisorsByDepartment(parseInt(departmentId, 10));
    ctx.body = { departmentSupervisors };
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

export const getDepartmentSupervisorsByUser = async (ctx: Context) => {
  const { userId } = ctx.params;

  try {
    const departmentSupervisors = await DepartmentSupervisorService.getDepartmentSupervisorsByUser(parseInt(userId, 10));
    ctx.body = { departmentSupervisors };
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
