import { Context } from "koa";
import * as UserRoleService from "../services/userRoleService";
import {
  createUserRoleSchema,
  updateUserRoleSchema,
} from "../validations/userRoleValidation";
import Joi from "joi/lib";

export const assignRoleToUser = async (ctx: Context) => {
  const { error, value } = createUserRoleSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const userRole = await UserRoleService.assignRoleToUser(value);
    ctx.body = { message: "Role assigned successfully", userRole };
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

export const updateUserRole = async (ctx: Context) => {
  const { id } = ctx.params;
  const { error, value } = updateUserRoleSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const updatedUserRole = await UserRoleService.updateUserRole(
      parseInt(id, 10),
      value
    );
    ctx.body = { message: "UserRole updated successfully", updatedUserRole };
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

export const deleteUserRole = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    await UserRoleService.deleteUserRole(parseInt(id, 10));
    ctx.body = { message: "UserRole deleted successfully" };
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

export const getUserRoles = async (ctx: Context) => {
  const { user_id } = ctx.params;

  try {
    const userRoles = await UserRoleService.getUserRoles(parseInt(user_id, 10));
    ctx.body = { userRoles };
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

export const getAllUserRoles = async (ctx: Context) => {
  try {
    const userRoles = await UserRoleService.getAllUserRoles();
    ctx.body = { userRoles };
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
