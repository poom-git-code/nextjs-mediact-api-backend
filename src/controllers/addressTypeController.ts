import { Context } from "koa";
import * as AddressTypeService from "../services/addressTypeService";
import Joi from "joi";
import {
  createAddressTypeSchema,
  updateAddressTypeSchema,
} from "../validations/addressTypeValidation";

export const createAddressType = async (ctx: Context) => {
  const data = ctx.request.body;

  const { error, value } = createAddressTypeSchema.validate(data);
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
    const role = await AddressTypeService.createAddressType(value, userId);
    ctx.status = 201;
    ctx.body = { message: "Address Type created successfully", role };
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

export const updateAddressType = async (ctx: Context) => {
  const { id } = ctx.params;
  const updates = ctx.request.body;
  const { error, value } = updateAddressTypeSchema.validate(updates);
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
    const updatedRole = await AddressTypeService.updateAddressType(
      parseInt(id, 10),
      value,
      userId
    );
    ctx.body = { message: "Address Type updated successfully", updatedRole };
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

export const deleteAddressType = async (ctx: Context) => {
  const userId = ctx.state.user.id;
  try {
    await AddressTypeService.deleteAddressType(Number(ctx.params.id), userId);
    ctx.body = { message: "Address Type deleted successfully" };
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

export const getAddressTypeById = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    const addressType = await AddressTypeService.getAddressTypeById(
      parseInt(id, 10)
    );
    ctx.body = { addressType };
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

export const getAllAddressTypes = async (ctx: Context) => {
  try {
    const addressTypes = await AddressTypeService.getAllAddressTypes();
    ctx.body = { addressTypes };
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

export const getAllAddressTypesManagement = async (ctx: Context) => {
  try {
    const addressTypes = await AddressTypeService.getAllAddressTypesManagement();
    ctx.body = { addressTypes };
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