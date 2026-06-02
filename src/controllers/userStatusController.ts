import { Context } from "koa";
import * as UserStatusService from "../services/userStatusService";

import Joi from "joi/lib";
import { createUserStatusSchema, updateUserStatusSchema } from "../validations/userStatusValidation";

export const assignStatusToUser = async (ctx: Context) => {
  const { error, value } = createUserStatusSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const userStatus = await UserStatusService.assignStatusToUser(value);
    ctx.body = { message: "Status assigned successfully", userStatus };
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

export const updateUserStatus = async (ctx: Context) => {
  const { id } = ctx.params;
  const { error, value } = updateUserStatusSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const updatedUserStatus = await UserStatusService.updateUserStatus(
      parseInt(id, 10),
      value
    );
    ctx.body = { message: "UserStatus updated successfully", updatedUserStatus };
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

export const deleteUserStatus = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    await UserStatusService.deleteUserStatus(parseInt(id, 10));
    ctx.body = { message: "UserStatus deleted successfully" };
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

export const getUserStatuses = async (ctx: Context) => {
  const { user_id } = ctx.params;

  try {
    const userStatuses = await UserStatusService.getUserStatuses(parseInt(user_id, 10));
    ctx.body = { userStatuses };
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

export const getAllUserStatuses = async (ctx: Context) => {
  try {
    const userStatuses = await UserStatusService.getAllUserStatuses();
    ctx.body = { userStatuses };
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