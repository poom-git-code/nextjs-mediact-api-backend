import { Context } from 'koa';
import * as UserDutyService from '../services/userDutyService';
import {
  createUserDutySchema,
  updateUserDutySchema,
  getUserDutyFiltersSchema,
  bulkUpdateUserDutySchema,
  getUserDutyByUserAndDateSchema,
  getUserDutyStatsSchema
} from '../validations/userDutyValidation';
import Joi from 'joi';

export const createUserDuty = async (ctx: Context) => {
  const { error, value } = createUserDutySchema.validate(ctx.request.body);
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
    const userDuty = await UserDutyService.createUserDuty(value, userId);
    ctx.status = 201;
    ctx.body = {
      message: 'User duty created successfully',
      userDuty
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

export const updateUserDuty = async (ctx: Context) => {
  const { id } = ctx.params;
  const { error, value } = updateUserDutySchema.validate(ctx.request.body);
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
    const userDuty = await UserDutyService.updateUserDuty(parseInt(id, 10), value, userId);
    ctx.body = {
      message: 'User duty updated successfully',
      userDuty
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

export const deleteUserDuty = async (ctx: Context) => {
  const { id } = ctx.params;

  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: 'Unauthorized: User ID not found in token' };
    return;
  }

  try {
    await UserDutyService.deleteUserDuty(parseInt(id, 10), userId);
    ctx.body = { message: 'User duty deleted successfully' };
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

export const getUserDutyById = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    const userDuty = await UserDutyService.getUserDutyById(parseInt(id, 10));
    ctx.body = { userDuty };
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

export const getUserDutyByUserAndDate = async (ctx: Context) => {
  const { userId, dutyDate } = ctx.params;
  const { error } = getUserDutyByUserAndDateSchema.validate({
    user_id: parseInt(userId, 10),
    duty_date: dutyDate
  });
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const userDuties = await UserDutyService.getUserDutyByUserAndDate(
      parseInt(userId, 10),
      dutyDate
    );
    ctx.body = { userDuties };
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

export const getAllUserDuties = async (ctx: Context) => {
  const { error, value } = getUserDutyFiltersSchema.validate(ctx.query);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const userDuties = await UserDutyService.getAllUserDuties(value);
    const totalCount = await UserDutyService.getUserDutyCount(value);

    ctx.body = {
      userDuties,
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

export const getUserDutiesByUser = async (ctx: Context) => {
  const { userId } = ctx.params;
  const { error, value } = getUserDutyFiltersSchema.validate(ctx.query);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const userDuties = await UserDutyService.getUserDutiesByUser(
      parseInt(userId, 10),
      value
    );
    ctx.body = { userDuties };
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

export const bulkUpdateUserDuties = async (ctx: Context) => {
  const { error, value } = bulkUpdateUserDutySchema.validate(ctx.request.body);
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
    const result = await UserDutyService.bulkUpdateUserDuties(
      value.user_duty_ids,
      value.updates,
      userId
    );
    ctx.body = {
      message: 'User duties updated successfully',
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

export const getUserDutyStats = async (ctx: Context) => {
  const { error, value } = getUserDutyStatsSchema.validate(ctx.query);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const stats = await UserDutyService.getUserDutyStats(value);
    ctx.body = { stats };
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

export const getUserDutyCalendar = async (ctx: Context) => {
  const { userId, year, month } = ctx.params;

  // Validate parameters
  const userIdNum = parseInt(userId, 10);
  const yearNum = parseInt(year, 10);
  const monthNum = parseInt(month, 10);

  if (isNaN(userIdNum) || isNaN(yearNum) || isNaN(monthNum)) {
    ctx.status = 400;
    ctx.body = { error: 'Invalid user ID, year, or month' };
    return;
  }

  if (monthNum < 1 || monthNum > 12) {
    ctx.status = 400;
    ctx.body = { error: 'Month must be between 1 and 12' };
    return;
  }

  try {
    const calendar = await UserDutyService.getUserDutyCalendar(userIdNum, yearNum, monthNum);
    ctx.body = { calendar };
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
