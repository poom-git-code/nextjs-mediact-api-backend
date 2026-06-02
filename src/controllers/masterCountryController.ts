import { Context } from "koa";
import * as MasterCountryService from "../services/masterCountryService";
import { createCountrySchema, updateCountrySchema } from "../validations/masterCountryValidation";
import Joi from "joi/lib";

export const createCountry = async (ctx: Context) => {
  const { error, value } = createCountrySchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }
  try {
    const userId = ctx.state.user?.id || null;
    const country = await MasterCountryService.createCountry(value, userId);
    ctx.body = { message: "Country created successfully", country };
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

export const updateCountry = async (ctx: Context) => {
  const { id } = ctx.params;
  const { error, value } = updateCountrySchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }
  try {
    const userId = ctx.state.user?.id || null;
    const updatedCountry = await MasterCountryService.updateCountry(parseInt(id, 10), value, userId);
    ctx.body = { message: "Country updated successfully", updatedCountry };
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

export const deleteCountry = async (ctx: Context) => {
  const { id } = ctx.params;
  try {
    const userId = ctx.state.user?.id || null;
    await MasterCountryService.deleteCountry(parseInt(id, 10), userId);
    ctx.body = { message: "Country deleted successfully" };
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

export const getCountryById = async (ctx: Context) => {
  const { id } = ctx.params;
  try {
    const country = await MasterCountryService.getCountryById(parseInt(id, 10));
    ctx.body = { country };
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

export const getAllCountries = async (ctx: Context) => {
  try {
    const countries = await MasterCountryService.getAllCountries();
    ctx.body = { countries };
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
