import Joi from 'joi';

export const createScheduleShiftSchema = Joi.object({
  schedule_master_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Schedule Master ID must be a number.',
    'number.integer': 'Schedule Master ID must be an integer.',
    'number.positive': 'Schedule Master ID must be a positive number.',
    'any.required': 'Schedule Master ID is required.',
  }),
  shift_type_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Shift Type ID must be a number.',
    'number.integer': 'Shift Type ID must be an integer.',
    'number.positive': 'Shift Type ID must be a positive number.',
    'any.required': 'Shift Type ID is required.',
  }),
  employee_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Employee ID must be a number.',
    'number.integer': 'Employee ID must be an integer.',
    'number.positive': 'Employee ID must be a positive number.',
    'any.required': 'Employee ID is required.',
  }),
  status_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Status ID must be a number.',
    'number.integer': 'Status ID must be an integer.',
    'number.positive': 'Status ID must be a positive number.',
    'any.required': 'Status ID is required.',
  }),
  start_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .optional()
    .messages({
      'string.base': 'Start time must be a string.',
      'string.pattern.base': 'Start time must be in HH:mm:ss format.',
    }),
  end_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .optional()
    .messages({
      'string.base': 'End time must be a string.',
      'string.pattern.base': 'End time must be in HH:mm:ss format.',
    }),
  total_hours: Joi.number().precision(2).min(0).max(24).optional().messages({
    'number.base': 'Total hours must be a number.',
    'number.min': 'Total hours must be at least 0.',
    'number.max': 'Total hours must not exceed 24.',
    'number.precision': 'Total hours must have at most 2 decimal places.',
  }),
  normal_hours: Joi.number().precision(2).min(0).max(24).optional().messages({
    'number.base': 'Normal hours must be a number.',
    'number.min': 'Normal hours must be at least 0.',
    'number.max': 'Normal hours must not exceed 24.',
    'number.precision': 'Normal hours must have at most 2 decimal places.',
  }),
  ot_hours: Joi.number().precision(2).min(0).max(24).optional().messages({
    'number.base': 'OT hours must be a number.',
    'number.min': 'OT hours must be at least 0.',
    'number.max': 'OT hours must not exceed 24.',
    'number.precision': 'OT hours must have at most 2 decimal places.',
  }),
  is_overtime: Joi.boolean().optional().messages({
    'boolean.base': 'Is overtime must be a boolean.',
  }),
  is_replacement: Joi.boolean().optional().messages({
    'boolean.base': 'Is replacement must be a boolean.',
  }),
  replaced_employee_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Replaced employee ID must be a number.',
    'number.integer': 'Replaced employee ID must be an integer.',
    'number.positive': 'Replaced employee ID must be a positive number.',
  }),
  actual_check_in: Joi.date().optional().messages({
    'date.base': 'Actual check-in must be a valid date.',
  }),
  actual_check_out: Joi.date().optional().messages({
    'date.base': 'Actual check-out must be a valid date.',
  }),
  late_minutes: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Late minutes must be a number.',
    'number.integer': 'Late minutes must be an integer.',
    'number.min': 'Late minutes must be at least 0.',
  }),
  early_leave_minutes: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Early leave minutes must be a number.',
    'number.integer': 'Early leave minutes must be an integer.',
    'number.min': 'Early leave minutes must be at least 0.',
  }),
  init_employee_id: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Init employee ID must be a number.',
    'number.integer': 'Init employee ID must be an integer.',
    'number.min': 'Init employee ID must be at least 0.',
  }),
  remarks: Joi.string().optional().messages({
    'string.base': 'Remarks must be a string.',
  }),
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'Is active must be a boolean.',
  }),
});

export const updateScheduleShiftSchema = Joi.object({
  schedule_master_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Schedule Master ID must be a number.',
    'number.integer': 'Schedule Master ID must be an integer.',
    'number.positive': 'Schedule Master ID must be a positive number.',
  }),
  shift_type_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Shift Type ID must be a number.',
    'number.integer': 'Shift Type ID must be an integer.',
    'number.positive': 'Shift Type ID must be a positive number.',
  }),
  employee_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Employee ID must be a number.',
    'number.integer': 'Employee ID must be an integer.',
    'number.positive': 'Employee ID must be a positive number.',
  }),
  status_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Status ID must be a number.',
    'number.integer': 'Status ID must be an integer.',
    'number.positive': 'Status ID must be a positive number.',
  }),
  start_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .optional()
    .messages({
      'string.base': 'Start time must be a string.',
      'string.pattern.base': 'Start time must be in HH:mm:ss format.',
    }),
  end_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .optional()
    .messages({
      'string.base': 'End time must be a string.',
      'string.pattern.base': 'End time must be in HH:mm:ss format.',
    }),
  total_hours: Joi.number().precision(2).min(0).max(24).optional().messages({
    'number.base': 'Total hours must be a number.',
    'number.min': 'Total hours must be at least 0.',
    'number.max': 'Total hours must not exceed 24.',
    'number.precision': 'Total hours must have at most 2 decimal places.',
  }),
  normal_hours: Joi.number().precision(2).min(0).max(24).optional().messages({
    'number.base': 'Normal hours must be a number.',
    'number.min': 'Normal hours must be at least 0.',
    'number.max': 'Normal hours must not exceed 24.',
    'number.precision': 'Normal hours must have at most 2 decimal places.',
  }),
  ot_hours: Joi.number().precision(2).min(0).max(24).optional().messages({
    'number.base': 'OT hours must be a number.',
    'number.min': 'OT hours must be at least 0.',
    'number.max': 'OT hours must not exceed 24.',
    'number.precision': 'OT hours must have at most 2 decimal places.',
  }),
  is_overtime: Joi.boolean().optional().messages({
    'boolean.base': 'Is overtime must be a boolean.',
  }),
  is_replacement: Joi.boolean().optional().messages({
    'boolean.base': 'Is replacement must be a boolean.',
  }),
  replaced_employee_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Replaced employee ID must be a number.',
    'number.integer': 'Replaced employee ID must be an integer.',
    'number.positive': 'Replaced employee ID must be a positive number.',
  }),
  actual_check_in: Joi.date().optional().messages({
    'date.base': 'Actual check-in must be a valid date.',
  }),
  actual_check_out: Joi.date().optional().messages({
    'date.base': 'Actual check-out must be a valid date.',
  }),
  late_minutes: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Late minutes must be a number.',
    'number.integer': 'Late minutes must be an integer.',
    'number.min': 'Late minutes must be at least 0.',
  }),
  early_leave_minutes: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Early leave minutes must be a number.',
    'number.integer': 'Early leave minutes must be an integer.',
    'number.min': 'Early leave minutes must be at least 0.',
  }),
  init_employee_id: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Init employee ID must be a number.',
    'number.integer': 'Init employee ID must be an integer.',
    'number.min': 'Init employee ID must be at least 0.',
  }),
  remarks: Joi.string().optional().messages({
    'string.base': 'Remarks must be a string.',
  }),
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'Is active must be a boolean.',
  }),
});