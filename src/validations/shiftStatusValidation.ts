import Joi from 'joi';

export const createShiftStatusSchema = Joi.object({
  name: Joi.string().max(50).required().messages({
    'string.base': 'Name must be a string.',
    'string.max': 'Name must not exceed 50 characters.',
    'any.required': 'Name is required.',
  }),
  description: Joi.string().optional().allow('').messages({
    'string.base': 'Description must be a string.',
  }),
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'Is active must be a boolean.',
  }),
});

export const updateShiftStatusSchema = Joi.object({
  name: Joi.string().max(50).optional().messages({
    'string.base': 'Name must be a string.',
    'string.max': 'Name must not exceed 50 characters.',
  }),
  description: Joi.string().optional().allow('').messages({
    'string.base': 'Description must be a string.',
  }),
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'Is active must be a boolean.',
  }),
});
