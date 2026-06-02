import Joi from 'joi';

// Validation for creating a new user-role relationship
export const createUserRoleSchema = Joi.object({
  user_id: Joi.number().integer().positive().required().messages({
    'number.base': 'User ID must be a number.',
    'number.integer': 'User ID must be an integer.',
    'number.positive': 'User ID must be a positive number.',
    'any.required': 'User ID is required.',
  }),
  role_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Role ID must be a number.',
    'number.integer': 'Role ID must be an integer.',
    'number.positive': 'Role ID must be a positive number.',
    'any.required': 'Role ID is required.',
  }),
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'Is active must be a boolean.',
  }),
});

// Validation for updating a user-role relationship
export const updateUserRoleSchema = Joi.object({
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'Is active must be a boolean.',
  }),
});