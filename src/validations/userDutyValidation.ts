import Joi from 'joi';

export const createUserDutySchema = Joi.object({
  user_id: Joi.number().integer().positive().required().messages({
    'number.base': 'User ID must be a number.',
    'number.integer': 'User ID must be an integer.',
    'number.positive': 'User ID must be a positive number.',
    'any.required': 'User ID is required.',
  }),
  duty_date: Joi.date().required().messages({
    'date.base': 'Duty date must be a valid date.',
    'any.required': 'Duty date is required.',
  }),
  duty_type_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Duty type ID must be a number.',
    'number.integer': 'Duty type ID must be an integer.',
    'number.positive': 'Duty type ID must be a positive number.',
    'any.required': 'Duty type ID is required.',
  }),
  reference_id: Joi.number().integer().positive().optional().allow(null).messages({
    'number.base': 'Reference ID must be a number.',
    'number.integer': 'Reference ID must be an integer.',
    'number.positive': 'Reference ID must be a positive number.',
  }),
  shift_type_id: Joi.number().integer().positive().optional().allow(null).messages({
    'number.base': 'Shift type ID must be a number.',
    'number.integer': 'Shift type ID must be an integer.',
    'number.positive': 'Shift type ID must be a positive number.',
  }),
  start_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).optional().allow(null).messages({
    'string.base': 'Start time must be a string.',
    'string.pattern.base': 'Start time must be in HH:MM:SS format.',
  }),
  end_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).optional().allow(null).messages({
    'string.base': 'End time must be a string.',
    'string.pattern.base': 'End time must be in HH:MM:SS format.',
  }),
  total_hours: Joi.number().min(0).max(24).precision(2).optional().allow(null).messages({
    'number.base': 'Total hours must be a number.',
    'number.min': 'Total hours must be at least 0.',
    'number.max': 'Total hours must not exceed 24.',
  }),
  status: Joi.string().max(50).optional().allow(null).messages({
    'string.base': 'Status must be a string.',
    'string.max': 'Status must not exceed 50 characters.',
  }),
  department_id: Joi.number().integer().positive().optional().allow(null).messages({
    'number.base': 'Department ID must be a number.',
    'number.integer': 'Department ID must be an integer.',
    'number.positive': 'Department ID must be a positive number.',
  }),
  schedule_master_id: Joi.number().integer().positive().optional().allow(null).messages({
    'number.base': 'Schedule master ID must be a number.',
    'number.integer': 'Schedule master ID must be an integer.',
    'number.positive': 'Schedule master ID must be a positive number.',
  }),
  is_active: Joi.boolean().optional().default(true).messages({
    'boolean.base': 'Is active must be a boolean.',
  }),
});

export const updateUserDutySchema = Joi.object({
  user_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'User ID must be a number.',
    'number.integer': 'User ID must be an integer.',
    'number.positive': 'User ID must be a positive number.',
  }),
  duty_date: Joi.date().optional().messages({
    'date.base': 'Duty date must be a valid date.',
  }),
  duty_type_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Duty type ID must be a number.',
    'number.integer': 'Duty type ID must be an integer.',
    'number.positive': 'Duty type ID must be a positive number.',
  }),
  reference_id: Joi.number().integer().positive().optional().allow(null).messages({
    'number.base': 'Reference ID must be a number.',
    'number.integer': 'Reference ID must be an integer.',
    'number.positive': 'Reference ID must be a positive number.',
  }),
  shift_type_id: Joi.number().integer().positive().optional().allow(null).messages({
    'number.base': 'Shift type ID must be a number.',
    'number.integer': 'Shift type ID must be an integer.',
    'number.positive': 'Shift type ID must be a positive number.',
  }),
  start_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).optional().allow(null).messages({
    'string.base': 'Start time must be a string.',
    'string.pattern.base': 'Start time must be in HH:MM:SS format.',
  }),
  end_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).optional().allow(null).messages({
    'string.base': 'End time must be a string.',
    'string.pattern.base': 'End time must be in HH:MM:SS format.',
  }),
  total_hours: Joi.number().min(0).max(24).precision(2).optional().allow(null).messages({
    'number.base': 'Total hours must be a number.',
    'number.min': 'Total hours must be at least 0.',
    'number.max': 'Total hours must not exceed 24.',
  }),
  status: Joi.string().max(50).optional().allow(null).messages({
    'string.base': 'Status must be a string.',
    'string.max': 'Status must not exceed 50 characters.',
  }),
  department_id: Joi.number().integer().positive().optional().allow(null).messages({
    'number.base': 'Department ID must be a number.',
    'number.integer': 'Department ID must be an integer.',
    'number.positive': 'Department ID must be a positive number.',
  }),
  schedule_master_id: Joi.number().integer().positive().optional().allow(null).messages({
    'number.base': 'Schedule master ID must be a number.',
    'number.integer': 'Schedule master ID must be an integer.',
    'number.positive': 'Schedule master ID must be a positive number.',
  }),
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'Is active must be a boolean.',
  }),
});

export const getUserDutyFiltersSchema = Joi.object({
  user_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'User ID must be a number.',
    'number.integer': 'User ID must be an integer.',
    'number.positive': 'User ID must be a positive number.',
  }),
  duty_date: Joi.date().optional().messages({
    'date.base': 'Duty date must be a valid date.',
  }),
  duty_date_from: Joi.date().optional().messages({
    'date.base': 'Duty date from must be a valid date.',
  }),
  duty_date_to: Joi.date().optional().messages({
    'date.base': 'Duty date to must be a valid date.',
  }),
  duty_type_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Duty type ID must be a number.',
    'number.integer': 'Duty type ID must be an integer.',
    'number.positive': 'Duty type ID must be a positive number.',
  }),
  status: Joi.string().max(50).optional().messages({
    'string.base': 'Status must be a string.',
    'string.max': 'Status must not exceed 50 characters.',
  }),
  department_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Department ID must be a number.',
    'number.integer': 'Department ID must be an integer.',
    'number.positive': 'Department ID must be a positive number.',
  }),
  schedule_master_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Schedule master ID must be a number.',
    'number.integer': 'Schedule master ID must be an integer.',
    'number.positive': 'Schedule master ID must be a positive number.',
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

export const bulkUpdateUserDutySchema = Joi.object({
  user_duty_ids: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
    'array.base': 'User duty IDs must be an array.',
    'array.min': 'At least one user duty ID is required.',
    'any.required': 'User duty IDs are required.',
  }),
  updates: Joi.object({
    status: Joi.string().max(50).optional().allow(null).messages({
      'string.base': 'Status must be a string.',
      'string.max': 'Status must not exceed 50 characters.',
    }),
    is_active: Joi.boolean().optional().messages({
      'boolean.base': 'Is active must be a boolean.',
    }),
    total_hours: Joi.number().min(0).max(24).precision(2).optional().allow(null).messages({
      'number.base': 'Total hours must be a number.',
      'number.min': 'Total hours must be at least 0.',
      'number.max': 'Total hours must not exceed 24.',
    }),
  }).min(1).required().messages({
    'object.min': 'At least one update field is required.',
    'any.required': 'Updates object is required.',
  }),
});

export const getUserDutyByUserAndDateSchema = Joi.object({
  user_id: Joi.number().integer().positive().required().messages({
    'number.base': 'User ID must be a number.',
    'number.integer': 'User ID must be an integer.',
    'number.positive': 'User ID must be a positive number.',
    'any.required': 'User ID is required.',
  }),
  duty_date: Joi.date().required().messages({
    'date.base': 'Duty date must be a valid date.',
    'any.required': 'Duty date is required.',
  }),
});

export const getUserDutyStatsSchema = Joi.object({
  user_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'User ID must be a number.',
    'number.integer': 'User ID must be an integer.',
    'number.positive': 'User ID must be a positive number.',
  }),
  month: Joi.number().integer().min(1).max(12).optional().messages({
    'number.base': 'Month must be a number.',
    'number.integer': 'Month must be an integer.',
    'number.min': 'Month must be between 1 and 12.',
    'number.max': 'Month must be between 1 and 12.',
  }),
  year: Joi.number().integer().min(2020).max(2100).optional().messages({
    'number.base': 'Year must be a number.',
    'number.integer': 'Year must be an integer.',
    'number.min': 'Year must be at least 2020.',
    'number.max': 'Year must be at most 2100.',
  }),
  department_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Department ID must be a number.',
    'number.integer': 'Department ID must be an integer.',
    'number.positive': 'Department ID must be a positive number.',
  }),
});
