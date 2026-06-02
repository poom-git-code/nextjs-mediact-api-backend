import Joi from 'joi';

export const createScheduleTemplateShiftSchema = Joi.object({
  template_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Template ID must be a number.',
    'number.integer': 'Template ID must be an integer.',
    'number.positive': 'Template ID must be a positive number.',
    'any.required': 'Template ID is required.',
  }),
  shift_type_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Shift Type ID must be a number.',
    'number.integer': 'Shift Type ID must be an integer.',
    'number.positive': 'Shift Type ID must be a positive number.',
    'any.required': 'Shift Type ID is required.',
  }),
  day_of_week: Joi.number().integer().min(0).max(6).required().messages({
    'number.base': 'Day of the week must be a number.',
    'number.integer': 'Day of the week must be an integer.',
    'number.min': 'Day of the week must be between 0 and 6.',
    'number.max': 'Day of the week must be between 0 and 6.',
    'any.required': 'Day of the week is required.',
  }),
  start_time: Joi.string().required().messages({
    'string.base': 'Start time must be a string.',
    'any.required': 'Start time is required.',
  }),
  end_time: Joi.string().required().messages({
    'string.base': 'End time must be a string.',
    'any.required': 'End time is required.',
  }),
  roles_allowed: Joi.string().optional().messages({
    'string.base': 'Roles allowed must be a string.',
  }),
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'Is active must be a boolean.',
  }),
});

export const updateScheduleTemplateShiftSchema = Joi.object({
  template_id: Joi.number().integer().positive().optional(),
  shift_type_id: Joi.number().integer().positive().optional(),
  day_of_week: Joi.number().integer().min(0).max(6).optional(),
  start_time: Joi.string().optional(),
  end_time: Joi.string().optional(),
  roles_allowed: Joi.string().optional(),
  is_active: Joi.boolean().optional(),
});