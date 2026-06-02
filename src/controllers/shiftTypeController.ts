import { Context } from "koa";
import * as ShiftTypeService from "../services/shiftTypeService";
import {
  createShiftTypeSchema,
  updateShiftTypeSchema,
} from "../validations/shiftTypeValidation";
import Joi from "joi/lib";

export const createShiftType = async (ctx: Context) => {
  const { error, value } = createShiftTypeSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const userId = ctx.state.user?.id || 1; // Get user ID from auth context
    const shiftType = await ShiftTypeService.createShiftType(value, userId);
    ctx.status = 201;
    ctx.body = { 
      message: "ShiftType created successfully", 
      data: shiftType 
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

export const updateShiftType = async (ctx: Context) => {
  const { id } = ctx.params;
  const { error, value } = updateShiftTypeSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const userId = ctx.state.user?.id || 1; // Get user ID from auth context
    const updatedShiftType = await ShiftTypeService.updateShiftType(
      parseInt(id, 10),
      value,
      userId
    );
    ctx.body = { 
      message: "ShiftType updated successfully", 
      data: updatedShiftType 
    };
  } catch (error) {
    console.log('ShiftType Update Error:', error); // เพิ่ม logging
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      console.log('Error message:', error.message); // เพิ่ม logging
      console.log('Error stack:', error.stack); // เพิ่ม logging
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const deleteShiftType = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    await ShiftTypeService.deleteShiftType(parseInt(id, 10));
    ctx.body = { message: "ShiftType deleted successfully" };
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

export const getShiftTypeById = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    const shiftType = await ShiftTypeService.getShiftTypeWithRelations(parseInt(id, 10));
    ctx.body = { 
      message: "ShiftType retrieved successfully",
      data: shiftType 
    };
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

export const getShiftTypeByFacility = async (ctx: Context) => {
  const userId = ctx.state.user.id;

  const { department_id } = ctx.query;

  const departmentIdNum = parseInt(department_id as string, 10)

  if (department_id && isNaN(departmentIdNum)) {
    ctx.status = 400;
    ctx.body = { error: "invalid department_id format" };
    return;
  }

  try {
    const shiftTypes = await ShiftTypeService.getShiftTypeByFacility(parseInt(userId, 10), departmentIdNum);
    ctx.body = { shiftTypes };
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

export const getAllShiftTypes = async (ctx: Context) => {
  try {
    const shiftTypes = await ShiftTypeService.getAllShiftTypes();
    ctx.body = { shiftTypes };
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

export const getShiftTypeWithRelations = async (ctx: Context) => {
  const { id } = ctx.params;
  
  try {
    const shiftType = await ShiftTypeService.getShiftTypeWithRelations(parseInt(id, 10));
    ctx.status = 200;
    ctx.body = shiftType;
  } catch (error) {
    ctx.status = 404;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

// === Mobile ===

export const getShiftTypesByDepartmentAndShiftDate = async (ctx: Context) => {
  const userId = ctx.state.user.id;

  const { department_id, shift_date } = ctx.query;

  const departmentIdNum = parseInt(department_id as string, 10)

  if (!department_id || isNaN(departmentIdNum)) {
    ctx.status = 400;
    ctx.body = { error: "department_id is required and must be a number" };
    return;
  }

  if (!shift_date) {
    ctx.status = 400;
    ctx.body = { error: "shift_date is required" };
    return;
  }

  try {
    const shiftTypes = await ShiftTypeService.getShiftTypesByDepartmentAndShiftDate(departmentIdNum, shift_date as string);
    ctx.body = { shiftTypes };
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