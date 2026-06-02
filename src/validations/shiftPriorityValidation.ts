import Joi from 'joi';

// Validation for creating/updating shift type group tag with priority
export const shiftTypeGroupTagSchema = Joi.object({
  shift_type_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Shift Type ID must be a number',
    'number.integer': 'Shift Type ID must be an integer',
    'number.positive': 'Shift Type ID must be positive',
    'any.required': 'Shift Type ID is required'
  }),
  user_group_tag_id: Joi.number().integer().positive().required().messages({
    'number.base': 'User Group Tag ID must be a number',
    'number.integer': 'User Group Tag ID must be an integer', 
    'number.positive': 'User Group Tag ID must be positive',
    'any.required': 'User Group Tag ID is required'
  }),
  min_count: Joi.number().integer().min(0).required().messages({
    'number.base': 'Minimum count must be a number',
    'number.integer': 'Minimum count must be an integer',
    'number.min': 'Minimum count cannot be negative',
    'any.required': 'Minimum count is required'
  }),
  priority_level: Joi.number().integer().min(1).max(10).optional().default(1).messages({
    'number.base': 'Priority level must be a number',
    'number.integer': 'Priority level must be an integer',
    'number.min': 'Priority level must be at least 1',
    'number.max': 'Priority level cannot exceed 10'
  }),
  is_primary_group: Joi.boolean().optional().default(false).messages({
    'boolean.base': 'Primary group flag must be true or false'
  }),
  is_active: Joi.boolean().optional().default(true).messages({
    'boolean.base': 'Active status must be true or false'
  })
});

// Validation for updating priority settings
export const updatePrioritySchema = Joi.object({
  priority_level: Joi.number().integer().min(1).max(10).required().messages({
    'number.base': 'Priority level must be a number',
    'number.integer': 'Priority level must be an integer',
    'number.min': 'Priority level must be at least 1',
    'number.max': 'Priority level cannot exceed 10',
    'any.required': 'Priority level is required'
  }),
  is_primary_group: Joi.boolean().required().messages({
    'boolean.base': 'Primary group flag must be true or false',
    'any.required': 'Primary group flag is required'
  })
});

// Validation for shift assignment request
export const shiftAssignmentRequestSchema = Joi.object({
  shift_type_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Shift Type ID must be a number',
    'number.integer': 'Shift Type ID must be an integer',
    'number.positive': 'Shift Type ID must be positive',
    'any.required': 'Shift Type ID is required'
  }),
  date: Joi.date().iso().required().messages({
    'date.base': 'Date must be a valid date',
    'date.format': 'Date must be in ISO format (YYYY-MM-DD)',
    'any.required': 'Date is required'
  }),
  required_roles: Joi.array().items(
    Joi.object({
      role_id: Joi.number().integer().positive().required().messages({
        'number.base': 'Role ID must be a number',
        'number.integer': 'Role ID must be an integer',
        'number.positive': 'Role ID must be positive',
        'any.required': 'Role ID is required'
      }),
      min_count: Joi.number().integer().min(1).required().messages({
        'number.base': 'Minimum count must be a number',
        'number.integer': 'Minimum count must be an integer',
        'number.min': 'Minimum count must be at least 1',
        'any.required': 'Minimum count is required'
      }),
      max_count: Joi.number().integer().min(Joi.ref('min_count')).optional().messages({
        'number.base': 'Maximum count must be a number',
        'number.integer': 'Maximum count must be an integer',
        'number.min': 'Maximum count must be greater than or equal to minimum count'
      })
    })
  ).min(1).required().messages({
    'array.base': 'Required roles must be an array',
    'array.min': 'At least one role is required',
    'any.required': 'Required roles are required'
  })
});

export default {
  shiftTypeGroupTagSchema,
  updatePrioritySchema,
  shiftAssignmentRequestSchema
};
