import { Context } from 'koa';
import * as ShiftStatusService from '../services/shiftStatusService';
import {
  createShiftStatusSchema,
  updateShiftStatusSchema,
} from '../validations/shiftStatusValidation';
import Joi from 'joi';

export const createShiftStatus = async (ctx: Context) => {
  const { error, value } = createShiftStatusSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    // Add created_by from the authenticated user
    const shiftStatusData = {
      ...value,
      created_by: ctx.state.user?.id || null,
    };

    const shiftStatus = await ShiftStatusService.createShiftStatus(shiftStatusData);
    ctx.body = { message: 'Shift Status created successfully', shiftStatus };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: 'Unknown error occurred' };
    }
  }
};

export const updateShiftStatus = async (ctx: Context) => {
  const { id } = ctx.params;
  const { error, value } = updateShiftStatusSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    // Add updated_by from the authenticated user
    const updateData = {
      ...value,
      updated_by: ctx.state.user?.id || null,
    };

    const updatedShiftStatus = await ShiftStatusService.updateShiftStatus(
      parseInt(id, 10),
      updateData
    );
    ctx.body = { message: 'Shift Status updated successfully', updatedShiftStatus };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: 'Unknown error occurred' };
    }
  }
};

export const deleteShiftStatus = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    await ShiftStatusService.deleteShiftStatus(parseInt(id, 10));
    ctx.body = { message: 'Shift Status deleted successfully' };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: 'Unknown error occurred' };
    }
  }
};

export const getShiftStatusById = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    const shiftStatus = await ShiftStatusService.getShiftStatusById(parseInt(id, 10));
    ctx.body = { shiftStatus };
  } catch (error) {
    ctx.status = 404;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: 'Unknown error occurred' };
    }
  }
};

export const getAllShiftStatuses = async (ctx: Context) => {
  try {
    const shiftStatuses = await ShiftStatusService.getAllShiftStatuses();
    ctx.body = { shiftStatuses };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: 'Unknown error occurred' };
    }
  }
};

export const getActiveShiftStatuses = async (ctx: Context) => {
  try {
    const shiftStatuses = await ShiftStatusService.getActiveShiftStatuses();
    ctx.body = { shiftStatuses };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: 'Unknown error occurred' };
    }
  }
};

export const getShiftStatusByName = async (ctx: Context) => {
  const { name } = ctx.params;

  try {
    const shiftStatus = await ShiftStatusService.getShiftStatusByName(name);
    if (!shiftStatus) {
      ctx.status = 404;
      ctx.body = { error: 'Shift Status not found' };
      return;
    }
    ctx.body = { shiftStatus };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: 'Unknown error occurred' };
    }
  }
};
