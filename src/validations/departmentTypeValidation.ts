import Joi from 'joi';

// Validation for creating a department type
export const createDepartmentTypeSchema = Joi.object({
  name: Joi.string().max(50).required().messages({
    'string.base': 'Name must be a string.',
    'string.max': 'Name must not exceed 50 characters.',
    'any.required': 'Name is required.',
  }),
  description: Joi.string().allow(null).optional().messages({
    'string.base': 'Description must be a string.',
  }),
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'Is Active must be a boolean.',
  }),
});

// Validation for updating a department type
export const updateDepartmentTypeSchema = Joi.object({
  name: Joi.string().max(50).optional().messages({
    'string.base': 'Name must be a string.',
    'string.max': 'Name must not exceed 50 characters.',
  }),
  description: Joi.string().allow(null).optional().messages({
    'string.base': 'Description must be a string.',
  }),
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'Is Active must be a boolean.',
  }),
});