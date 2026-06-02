import { Context } from 'koa';
import * as DutyTypeService from '../services/dutyTypeService';
import {
  createDutyTypeSchema,
  updateDutyTypeSchema,
  getDutyTypeFiltersSchema,
  bulkUpdateDutyTypesSchema,
  getDutyTypeByCodeSchema,
  validateDutyTypeExistsSchema
} from '../validations/dutyTypeValidation';
import Joi from 'joi';

export const createDutyType = async (ctx: Context) => {
  const { error, value } = createDutyTypeSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: 'Unauthorized: User ID not found in token' };
    return;
  }

  try {
    const dutyType = await DutyTypeService.createDutyType(value, userId);
    ctx.status = 201;
    ctx.body = { 
      message: 'Duty type created successfully', 
      dutyType 
    };
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

export const updateDutyType = async (ctx: Context) => {
  const { id } = ctx.params;
  const { error, value } = updateDutyTypeSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: 'Unauthorized: User ID not found in token' };
    return;
  }

  try {
    const dutyType = await DutyTypeService.updateDutyType(parseInt(id, 10), value, userId);
    ctx.body = { 
      message: 'Duty type updated successfully', 
      dutyType 
    };
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

export const deleteDutyType = async (ctx: Context) => {
  const { id } = ctx.params;

  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: 'Unauthorized: User ID not found in token' };
    return;
  }

  try {
    await DutyTypeService.deleteDutyType(parseInt(id, 10), userId);
    ctx.body = { message: 'Duty type deleted successfully' };
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

export const getDutyTypeById = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    const dutyType = await DutyTypeService.getDutyTypeById(parseInt(id, 10));
    ctx.body = { dutyType };
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

export const getDutyTypeByCode = async (ctx: Context) => {
  const { code } = ctx.params;
  const { error } = getDutyTypeByCodeSchema.validate({ code });
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const dutyType = await DutyTypeService.getDutyTypeByCode(code);
    ctx.body = { dutyType };
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

export const getAllDutyTypes = async (ctx: Context) => {
  const { error, value } = getDutyTypeFiltersSchema.validate(ctx.query);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const dutyTypes = await DutyTypeService.getAllDutyTypes(value);
    const totalCount = await DutyTypeService.getDutyTypeCount(value);
    
    ctx.body = { 
      dutyTypes, 
      totalCount,
      pagination: {
        limit: value.limit,
        offset: value.offset,
        total: totalCount
      }
    };
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

export const getActiveDutyTypes = async (ctx: Context) => {
  try {
    const dutyTypes = await DutyTypeService.getActiveDutyTypes();
    ctx.body = { dutyTypes };
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

export const bulkUpdateDutyTypes = async (ctx: Context) => {
  const { error, value } = bulkUpdateDutyTypesSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: 'Unauthorized: User ID not found in token' };
    return;
  }

  try {
    const result = await DutyTypeService.bulkUpdateDutyTypes(
      value.duty_type_ids, 
      value.updates, 
      userId
    );
    ctx.body = { 
      message: 'Duty types updated successfully', 
      affectedRows: result[0] 
    };
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

export const validateDutyTypeExists = async (ctx: Context) => {
  const { error, value } = validateDutyTypeExistsSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const result = await DutyTypeService.validateDutyTypeExists(value.codes);
    ctx.body = { 
      valid: result.valid,
      found: result.found,
      missing: result.missing
    };
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
