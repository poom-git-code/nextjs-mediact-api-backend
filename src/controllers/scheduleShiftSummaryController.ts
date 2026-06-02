import { Context } from 'koa';
import * as ScheduleShiftSummaryService from '../services/scheduleShiftSummaryService';
import {
  createScheduleShiftSummarySchema,
  updateScheduleShiftSummarySchema,
  getScheduleShiftSummaryFiltersSchema,
  bulkUpdateScheduleShiftSummarySchema,
} from '../validations/scheduleShiftSummaryValidation';
import Joi from 'joi';

export const createScheduleShiftSummary = async (ctx: Context) => {
  const { error, value } = createScheduleShiftSummarySchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const userId = ctx.state.user?.id;
    const summaryData = {
      ...value,
      created_by: userId,
      updated_by: userId,
    };

    const summary = await ScheduleShiftSummaryService.createScheduleShiftSummary(summaryData);
    ctx.status = 201;
    ctx.body = {
      message: 'Schedule Shift Summary created successfully',
      data: summary,
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

export const updateScheduleShiftSummary = async (ctx: Context) => {
  const { id } = ctx.params;
  const { error, value } = updateScheduleShiftSummarySchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const userId = ctx.state.user?.id;
    const updateData = {
      ...value,
      updated_by: userId,
    };

    const updatedSummary = await ScheduleShiftSummaryService.updateScheduleShiftSummary(
      parseInt(id, 10),
      updateData
    );
    ctx.body = {
      message: 'Schedule Shift Summary updated successfully',
      data: updatedSummary,
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

export const deleteScheduleShiftSummary = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    const result = await ScheduleShiftSummaryService.deleteScheduleShiftSummary(parseInt(id, 10));
    ctx.body = result;
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

export const getScheduleShiftSummaryById = async (ctx: Context) => {
  const { id } = ctx.params;
  const { include_relations } = ctx.query;

  try {
    const summary = await ScheduleShiftSummaryService.getScheduleShiftSummaryById(
      parseInt(id, 10),
      include_relations === 'true'
    );
    ctx.body = {
      message: 'Schedule Shift Summary retrieved successfully',
      data: summary,
    };
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

export const getAllScheduleShiftSummaries = async (ctx: Context) => {
  try {
    const { error, value } = getScheduleShiftSummaryFiltersSchema.validate(ctx.query);
    if (error) {
      ctx.status = 400;
      ctx.body = { error: error.details[0].message };
      return;
    }

    const filters = {
      ...value,
      include_relations: ctx.query.include_relations === 'true',
    };

    const result = await ScheduleShiftSummaryService.getAllScheduleShiftSummaries(filters);
    ctx.body = {
      message: 'Schedule Shift Summaries retrieved successfully',
      data: result.summaries,
      pagination: {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        limit: filters.limit,
        offset: filters.offset,
      },
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

export const getScheduleShiftSummariesByScheduleMaster = async (ctx: Context) => {
  const { scheduleId } = ctx.params;

  try {
    const summaries = await ScheduleShiftSummaryService.getScheduleShiftSummariesByScheduleMaster(
      parseInt(scheduleId, 10)
    );
    ctx.body = {
      message: 'Schedule Shift Summaries retrieved successfully',
      data: summaries,
      count: summaries.length,
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

export const getScheduleShiftSummariesByDepartment = async (ctx: Context) => {
  const { departmentId } = ctx.params;

  try {
    const summaries = await ScheduleShiftSummaryService.getScheduleShiftSummariesByDepartment(
      parseInt(departmentId, 10)
    );
    ctx.body = {
      message: 'Schedule Shift Summaries retrieved successfully',
      data: summaries,
      count: summaries.length,
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

export const getScheduleShiftSummariesByShiftType = async (ctx: Context) => {
  const { shiftTypeId } = ctx.params;

  try {
    const summaries = await ScheduleShiftSummaryService.getScheduleShiftSummariesByShiftType(
      parseInt(shiftTypeId, 10)
    );
    ctx.body = {
      message: 'Schedule Shift Summaries retrieved successfully',
      data: summaries,
      count: summaries.length,
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

export const getActiveScheduleShiftSummaries = async (ctx: Context) => {
  try {
    const summaries = await ScheduleShiftSummaryService.getActiveScheduleShiftSummaries();
    ctx.body = {
      message: 'Active Schedule Shift Summaries retrieved successfully',
      data: summaries,
      count: summaries.length,
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

export const bulkUpdateScheduleShiftSummaries = async (ctx: Context) => {
  const { error, value } = bulkUpdateScheduleShiftSummarySchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const userId = ctx.state.user?.id;
    const updates = {
      ...value.updates,
      updated_by: userId,
    };

    const result = await ScheduleShiftSummaryService.bulkUpdateScheduleShiftSummaries(
      value.summary_ids,
      updates
    );
    ctx.body = result;
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

export const softDeleteScheduleShiftSummary = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    const result = await ScheduleShiftSummaryService.softDeleteScheduleShiftSummary(parseInt(id, 10));
    ctx.body = result;
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

export const getScheduleShiftSummaryStats = async (ctx: Context) => {
  try {
    const filters = {
      schedule_master_id: ctx.query.schedule_master_id ? parseInt(ctx.query.schedule_master_id as string, 10) : undefined,
      department_id: ctx.query.department_id ? parseInt(ctx.query.department_id as string, 10) : undefined,
      is_active: ctx.query.is_active !== undefined ? ctx.query.is_active === 'true' : undefined,
    };

    const stats = await ScheduleShiftSummaryService.getScheduleShiftSummaryStats(filters);
    ctx.body = {
      message: 'Schedule Shift Summary statistics retrieved successfully',
      data: stats,
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

export const upsertScheduleShiftSummary = async (ctx: Context) => {
  const { error, value } = createScheduleShiftSummarySchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const userId = ctx.state.user?.id;
    const summaryData = {
      ...value,
      created_by: userId,
      updated_by: userId,
    };

    const result = await ScheduleShiftSummaryService.upsertScheduleShiftSummary(summaryData);
    ctx.status = result.created ? 201 : 200;
    ctx.body = {
      message: result.created 
        ? 'Schedule Shift Summary created successfully'
        : 'Schedule Shift Summary updated successfully',
      data: result.summary,
      created: result.created,
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
