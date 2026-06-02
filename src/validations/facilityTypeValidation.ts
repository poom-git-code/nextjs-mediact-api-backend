import Joi from 'joi';

// Validation for creating a facility type
export const createFacilityTypeSchema = Joi.object({
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

// Validation for updating a facility type
export const updateFacilityTypeSchema = Joi.object({
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