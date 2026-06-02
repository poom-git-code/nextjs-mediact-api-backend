import { Context } from "koa";
import * as FacilityService from "../services/facilityService";
import {
  createFacilitySchema,
  updateFacilitySchema,
} from "../validations/facilityValidation";
import Joi from "joi/lib";

export const createFacility = async (ctx: Context) => {
  const data = ctx.request.body;

  const { error, value } = createFacilitySchema.validate(data);
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
    const facility = await FacilityService.createFacility(value, userId);
    ctx.body = { message: "Facility created successfully", facility };
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

export const updateFacility = async (ctx: Context) => {
  const { id } = ctx.params;
  const updates = ctx.request.body;

  const { error, value } = updateFacilitySchema.validate(updates);
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
    const updatedFacility = await FacilityService.updateFacility(
      parseInt(id, 10),
      value,
      userId
    );
    ctx.body = { message: "Facility updated successfully", updatedFacility };
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

export const deleteFacility = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    await FacilityService.deleteFacility(parseInt(id, 10));
    ctx.body = { message: "Facility deleted successfully" };
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

export const getFacilityById = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    const facility = await FacilityService.getFacilityById(parseInt(id, 10));
    ctx.body = { facility };
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

export const getAllFacilities = async (ctx: Context) => {
  try {
    const { page, pageSize, search } = ctx.query;

    const pageNum = page ? parseInt(page as string, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize as string, 10) : 25;
    const searchQuery = search as string | undefined;

    if (isNaN(pageNum) || pageNum <= 0) {
      ctx.status = 400;
      ctx.body = { error: "Invalid 'page' parameter. Must be a positive number." };
      return;
    }
    if (isNaN(pageSizeNum) || pageSizeNum <= 0) {
      ctx.status = 400;
      ctx.body = { error: "Invalid 'pageSize' parameter. Must be a positive number." };
      return;
    }

    const { facilities, total } = await FacilityService.getAllFacilities(
      pageNum,
      pageSizeNum,
      searchQuery
    );

    ctx.body = { facilities, total };
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
