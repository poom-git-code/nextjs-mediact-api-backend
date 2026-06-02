import Joi from 'joi';

// Validation for creating a new user-status relationship
export const createUserStatusSchema = Joi.object({
  user_id: Joi.number().integer().positive().required().messages({
    'number.base': 'User ID must be a number.',
    'number.integer': 'User ID must be an integer.',
    'number.positive': 'User ID must be a positive number.',
    'any.required': 'User ID is required.',
  }),
  status_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Status ID must be a number.',
    'number.integer': 'Status ID must be an integer.',
    'number.positive': 'Status ID must be a positive number.',
    'any.required': 'Status ID is required.',
  }),
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'Is active must be a boolean.',
  }),
});

// Validation for updating a user-status relationship
export const updateUserStatusSchema = Joi.object({
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'Is active must be a boolean.',
  }),
});