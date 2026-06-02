import { Context } from "koa";
import * as FacilityTypeService from "../services/facilityTypeService";
import {
  createFacilityTypeSchema,
  updateFacilityTypeSchema,
} from "../validations/facilityTypeValidation";
import Joi from "joi/lib";

export const createFacilityType = async (ctx: Context) => {
  const data = ctx.request.body;
  const { error, value } = createFacilityTypeSchema.validate(data);
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
    const facilityType = await FacilityTypeService.createFacilityType(value, userId);
    ctx.body = { message: "Facility Type created successfully", facilityType };
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

export const updateFacilityType = async (ctx: Context) => {
  const { id } = ctx.params;
  const updates = ctx.request.body;

  const { error, value } = updateFacilityTypeSchema.validate(updates);
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
    const updatedFacilityType = await FacilityTypeService.updateFacilityType(
      parseInt(id, 10),
      value,
      userId
    );
    ctx.body = {
      message: "Facility Type updated successfully",
      updatedFacilityType,
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

export const deleteFacilityType = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    await FacilityTypeService.deleteFacilityType(parseInt(id, 10));
    ctx.body = { message: "Facility Type deleted successfully" };
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

export const getFacilityTypeById = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    const facilityType = await FacilityTypeService.getFacilityTypeById(
      parseInt(id, 10)
    );
    ctx.body = { facilityType };
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

export const getAllFacilityTypes = async (ctx: Context) => {
  try {
    const facilityTypes = await FacilityTypeService.getAllFacilityTypes();
    ctx.body = { facilityTypes };
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
