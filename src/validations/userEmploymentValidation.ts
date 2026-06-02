import Joi from 'joi';

// Validation for creating a new user employment
export const createUserEmploymentSchema = Joi.object({
  user_id: Joi.number().integer().positive().required().messages({
    'number.base': 'User ID must be a number.',
    'number.integer': 'User ID must be an integer.',
    'number.positive': 'User ID must be a positive number.',
    'any.required': 'User ID is required.',
  }),
  department_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Department ID must be a number.',
    'number.integer': 'Department ID must be an integer.',
    'number.positive': 'Department ID must be a positive number.',
    'any.required': 'Department ID is required.',
  }),
  facility_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Facility ID must be a number.',
    'number.integer': 'Facility ID must be an integer.',
    'number.positive': 'Facility ID must be a positive number.',
    'any.required': 'Facility ID is required.',
  }),
  position_id: Joi.string().max(255).optional().allow(null).messages({
    'string.base': 'Position ID must be a string.',
    'string.max': 'Position ID must not exceed 255 characters.',
  }),
  start_date: Joi.date().optional().allow(null).messages({
    'date.base': 'Start date must be a valid date.',
  }),
  end_date: Joi.date().optional().allow(null).messages({
    'date.base': 'End date must be a valid date.',
  }),
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'Is active must be a boolean.',
  }),
  is_part_time: Joi.boolean().optional().allow(null).messages({
    'boolean.base': 'Is part-time must be a boolean value.',
  }),
});

// Validation for updating a user employment
export const updateUserEmploymentSchema = Joi.object({
  department_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Department ID must be a number.',
    'number.integer': 'Department ID must be an integer.',
    'number.positive': 'Department ID must be a positive number.',
  }),
  facility_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Facility ID must be a number.',
    'number.integer': 'Facility ID must be an integer.',
    'number.positive': 'Facility ID must be a positive number.',
  }),
  position_id: Joi.string().max(255).optional().allow(null).messages({
    'string.base': 'Position ID must be a string.',
    'string.max': 'Position ID must not exceed 255 characters.',
  }),
  start_date: Joi.date().optional().allow(null).messages({
    'date.base': 'Start date must be a valid date.',
  }),
  end_date: Joi.date().optional().allow(null).messages({
    'date.base': 'End date must be a valid date.',
  }),
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'Is active must be a boolean.',
  }),
  is_part_time: Joi.boolean().optional().allow(null).messages({
    'boolean.base': 'Is part-time must be a boolean value.',
  }),
});