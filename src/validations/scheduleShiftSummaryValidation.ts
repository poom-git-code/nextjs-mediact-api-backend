import Joi from 'joi';

export const createScheduleShiftSummarySchema = Joi.object({
  schedule_master_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Schedule Master ID must be a number.',
    'number.integer': 'Schedule Master ID must be an integer.',
    'number.positive': 'Schedule Master ID must be a positive number.',
    'any.required': 'Schedule Master ID is required.',
  }),
  department_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Department ID must be a number.',
    'number.integer': 'Department ID must be an integer.',
    'number.positive': 'Department ID must be a positive number.',
    'any.required': 'Department ID is required.',
  }),
  shift_type_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Shift Type ID must be a number.',
    'number.integer': 'Shift Type ID must be an integer.',
    'number.positive': 'Shift Type ID must be a positive number.',
    'any.required': 'Shift Type ID is required.',
  }),
  total_shifts: Joi.number().integer().min(0).optional().default(0).messages({
    'number.base': 'Total shifts must be a number.',
    'number.integer': 'Total shifts must be an integer.',
    'number.min': 'Total shifts must be at least 0.',
  }),
  total_hours: Joi.number().precision(2).min(0).optional().default(0).messages({
    'number.base': 'Total hours must be a number.',
    'number.min': 'Total hours must be at least 0.',
  }),
  total_normal_hours: Joi.number().precision(2).min(0).optional().default(0).messages({
    'number.base': 'Total normal hours must be a number.',
    'number.min': 'Total normal hours must be at least 0.',
  }),
  total_ot_hours: Joi.number().precision(2).min(0).optional().default(0).messages({
    'number.base': 'Total OT hours must be a number.',
    'number.min': 'Total OT hours must be at least 0.',
  }),
  total_employees: Joi.number().integer().min(0).optional().default(0).messages({
    'number.base': 'Total employees must be a number.',
    'number.integer': 'Total employees must be an integer.',
    'number.min': 'Total employees must be at least 0.',
  }),
  is_active: Joi.boolean().optional().default(true).messages({
    'boolean.base': 'Is active must be a boolean.',
  }),
  created_by: Joi.number().integer().optional().allow(null).messages({
    'number.base': 'Created by must be a number.',
    'number.integer': 'Created by must be an integer.',
  }),
  updated_by: Joi.number().integer().optional().allow(null).messages({
    'number.base': 'Updated by must be a number.',
    'number.integer': 'Updated by must be an integer.',
  }),
}).custom((value, helpers) => {
  // Validate that total_hours = total_normal_hours + total_ot_hours
  const totalHours = value.total_hours || 0;
  const normalHours = value.total_normal_hours || 0;
  const otHours = value.total_ot_hours || 0;
  
  if (Math.abs(totalHours - (normalHours + otHours)) > 0.01) {
    return helpers.error('custom.totalHoursSum');
  }
  
  return value;
}).messages({
  'custom.totalHoursSum': 'Total hours must equal normal hours plus OT hours.',
});

export const updateScheduleShiftSummarySchema = Joi.object({
  schedule_master_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Schedule Master ID must be a number.',
    'number.integer': 'Schedule Master ID must be an integer.',
    'number.positive': 'Schedule Master ID must be a positive number.',
  }),
  department_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Department ID must be a number.',
    'number.integer': 'Department ID must be an integer.',
    'number.positive': 'Department ID must be a positive number.',
  }),
  shift_type_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Shift Type ID must be a number.',
    'number.integer': 'Shift Type ID must be an integer.',
    'number.positive': 'Shift Type ID must be a positive number.',
  }),
  total_shifts: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Total shifts must be a number.',
    'number.integer': 'Total shifts must be an integer.',
    'number.min': 'Total shifts must be at least 0.',
  }),
  total_hours: Joi.number().precision(2).min(0).optional().messages({
    'number.base': 'Total hours must be a number.',
    'number.min': 'Total hours must be at least 0.',
  }),
  total_normal_hours: Joi.number().precision(2).min(0).optional().messages({
    'number.base': 'Total normal hours must be a number.',
    'number.min': 'Total normal hours must be at least 0.',
  }),
  total_ot_hours: Joi.number().precision(2).min(0).optional().messages({
    'number.base': 'Total OT hours must be a number.',
    'number.min': 'Total OT hours must be at least 0.',
  }),
  total_employees: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Total employees must be a number.',
    'number.integer': 'Total employees must be an integer.',
    'number.min': 'Total employees must be at least 0.',
  }),
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'Is active must be a boolean.',
  }),
  updated_by: Joi.number().integer().optional().allow(null).messages({
    'number.base': 'Updated by must be a number.',
    'number.integer': 'Updated by must be an integer.',
  }),
}).custom((value, helpers) => {
  // Validate that total_hours = total_normal_hours + total_ot_hours (if all are provided)
  const totalHours = value.total_hours;
  const normalHours = value.total_normal_hours;
  const otHours = value.total_ot_hours;
  
  if (totalHours !== undefined && normalHours !== undefined && otHours !== undefined) {
    if (Math.abs(totalHours - (normalHours + otHours)) > 0.01) {
      return helpers.error('custom.totalHoursSum');
    }
  }
  
  return value;
}).messages({
  'custom.totalHoursSum': 'Total hours must equal normal hours plus OT hours.',
});

export const getScheduleShiftSummaryFiltersSchema = Joi.object({
  schedule_master_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Schedule Master ID must be a number.',
    'number.integer': 'Schedule Master ID must be an integer.',
    'number.positive': 'Schedule Master ID must be a positive number.',
  }),
  department_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Department ID must be a number.',
    'number.integer': 'Department ID must be an integer.',
    'number.positive': 'Department ID must be a positive number.',
  }),
  shift_type_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Shift Type ID must be a number.',
    'number.integer': 'Shift Type ID must be an integer.',
    'number.positive': 'Shift Type ID must be a positive number.',
  }),
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'Is active must be a boolean.',
  }),
  limit: Joi.number().integer().min(1).max(1000).optional().default(100).messages({
    'number.base': 'Limit must be a number.',
    'number.integer': 'Limit must be an integer.',
    'number.min': 'Limit must be at least 1.',
    'number.max': 'Limit must be at most 1000.',
  }),
  offset: Joi.number().integer().min(0).optional().default(0).messages({
    'number.base': 'Offset must be a number.',
    'number.integer': 'Offset must be an integer.',
    'number.min': 'Offset must be at least 0.',
  }),
});

export const bulkUpdateScheduleShiftSummarySchema = Joi.object({
  summary_ids: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
    'array.base': 'Summary IDs must be an array.',
    'array.min': 'At least one summary ID is required.',
    'any.required': 'Summary IDs are required.',
  }),
  updates: Joi.object({
    is_active: Joi.boolean().optional().messages({
      'boolean.base': 'Is active must be a boolean.',
    }),
    total_shifts: Joi.number().integer().min(0).optional().messages({
      'number.base': 'Total shifts must be a number.',
      'number.integer': 'Total shifts must be an integer.',
      'number.min': 'Total shifts must be at least 0.',
    }),
    total_hours: Joi.number().precision(2).min(0).optional().messages({
      'number.base': 'Total hours must be a number.',
      'number.min': 'Total hours must be at least 0.',
    }),
    total_normal_hours: Joi.number().precision(2).min(0).optional().messages({
      'number.base': 'Total normal hours must be a number.',
      'number.min': 'Total normal hours must be at least 0.',
    }),
    total_ot_hours: Joi.number().precision(2).min(0).optional().messages({
      'number.base': 'Total OT hours must be a number.',
      'number.min': 'Total OT hours must be at least 0.',
    }),
    total_employees: Joi.number().integer().min(0).optional().messages({
      'number.base': 'Total employees must be a number.',
      'number.integer': 'Total employees must be an integer.',
      'number.min': 'Total employees must be at least 0.',
    }),
  }).min(1).required().messages({
    'object.min': 'At least one update field is required.',
    'any.required': 'Updates object is required.',
  }),
});
