import Joi from 'joi';

// Validation for creating a facility admin
export const createFacilityAdminSchema = Joi.object({
  facility_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Facility ID must be a number.',
    'number.integer': 'Facility ID must be an integer.',
    'number.positive': 'Facility ID must be a positive number.',
    'any.required': 'Facility ID is required.',
  }),
  user_id: Joi.number().integer().positive().required().messages({
    'number.base': 'User ID must be a number.',
    'number.integer': 'User ID must be an integer.',
    'number.positive': 'User ID must be a positive number.',
    'any.required': 'User ID is required.',
  }),
  assigned_at: Joi.date().optional().messages({
    'date.base': 'Assigned at must be a valid date.',
  }),
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'Is Active must be a boolean.',
  }),
});

// Validation for updating a facility admin
export const updateFacilityAdminSchema = Joi.object({
  facility_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Facility ID must be a number.',
    'number.integer': 'Facility ID must be an integer.',
    'number.positive': 'Facility ID must be a positive number.',
  }),
  user_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'User ID must be a number.',
    'number.integer': 'User ID must be an integer.',
    'number.positive': 'User ID must be a positive number.',
  }),
  assigned_at: Joi.date().optional().messages({
    'date.base': 'Assigned at must be a valid date.',
  }),
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'Is Active must be a boolean.',
  }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update.',
});

// Validation for getting facility admins by facility ID
export const getFacilityAdminsByFacilitySchema = Joi.object({
  facility_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Facility ID must be a number.',
    'number.integer': 'Facility ID must be an integer.',
    'number.positive': 'Facility ID must be a positive number.',
    'any.required': 'Facility ID is required.',
  }),
});

// Validation for getting facility admins by user ID
export const getFacilityAdminsByUserSchema = Joi.object({
  user_id: Joi.number().integer().positive().required().messages({
    'number.base': 'User ID must be a number.',
    'number.integer': 'User ID must be an integer.',
    'number.positive': 'User ID must be a positive number.',
    'any.required': 'User ID is required.',
  }),
});
