import { Context } from "koa";
import * as RoleService from "../services/roleService";
import Joi from "joi";
import {
  createRoleSchema,
  updateRoleSchema,
} from "../validations/roleValidation";

export const createRole = async (ctx: Context) => {
  const data = ctx.request.body;

  const { error, value } = createRoleSchema.validate(data);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized: User ID not found in token" };
    return;
  }

  try {
    const role = await RoleService.createRole(value, userId);
    ctx.status = 201;
    ctx.body = { message: "Role created successfully", role };
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

export const updateRole = async (ctx: Context) => {
  const { id } = ctx.params;
  const updates = ctx.request.body;
  const { error, value } = updateRoleSchema.validate(updates);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized: User ID not found in token" };
    return;
  }

  try {
    const updatedRole = await RoleService.updateRole(
      parseInt(id, 10),
      value,
      userId
    );
    ctx.body = { message: "Role updated successfully", updatedRole };
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

export const deleteRole = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    await RoleService.deleteRole(parseInt(id, 10));
    ctx.body = { message: "Role deleted successfully" };
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

export const getRoleById = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    const role = await RoleService.getRoleById(parseInt(id, 10));
    ctx.body = { role };
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

export const getAllRoles = async (ctx: Context) => {
  try {
    const roles = await RoleService.getAllRoles();
    ctx.body = { roles };
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

export const getRolesUserView = async (ctx: Context) => {
  try {
    const roles = await RoleService.getRolesUserView();
    ctx.status = 200;
    ctx.body = { roles };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to fetch active roles' };
  }
};
