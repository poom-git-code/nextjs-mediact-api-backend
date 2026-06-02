import Joi from 'joi';

export const createCountrySchema = Joi.object({
  code: Joi.string().max(10).required().messages({
    'string.base': 'Country code must be a string.',
    'string.max': 'Country code must be at most 10 characters.',
    'any.required': 'Country code is required.',
  }),
  name: Joi.string().max(255).required().messages({
    'string.base': 'Country name must be a string.',
    'string.max': 'Country name must be at most 255 characters.',
    'any.required': 'Country name is required.',
  }),
  region: Joi.string().max(100).allow(null, '').optional().messages({
    'string.base': 'Region must be a string.',
    'string.max': 'Region must be at most 100 characters.',
  }),
  sub_region: Joi.string().max(100).allow(null, '').optional().messages({
    'string.base': 'Sub-region must be a string.',
    'string.max': 'Sub-region must be at most 100 characters.',
  }),
  latitude: Joi.number().precision(6).allow(null).optional().messages({
    'number.base': 'Latitude must be a number.',
  }),
  longitude: Joi.number().precision(6).allow(null).optional().messages({
    'number.base': 'Longitude must be a number.',
  }),
  phone_code: Joi.string().max(10).allow(null, '').optional().messages({
    'string.base': 'Phone code must be a string.',
    'string.max': 'Phone code must be at most 10 characters.',
  }),
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'Is active must be a boolean.',
  }),
});

export const updateCountrySchema = Joi.object({
  code: Joi.string().max(10).optional().messages({
    'string.base': 'Country code must be a string.',
    'string.max': 'Country code must be at most 10 characters.',
  }),
  name: Joi.string().max(255).optional().messages({
    'string.base': 'Country name must be a string.',
    'string.max': 'Country name must be at most 255 characters.',
  }),
  region: Joi.string().max(100).allow(null, '').optional().messages({
    'string.base': 'Region must be a string.',
    'string.max': 'Region must be at most 100 characters.',
  }),
  sub_region: Joi.string().max(100).allow(null, '').optional().messages({
    'string.base': 'Sub-region must be a string.',
    'string.max': 'Sub-region must be at most 100 characters.',
  }),
  latitude: Joi.number().precision(6).allow(null).optional().messages({
    'number.base': 'Latitude must be a number.',
  }),
  longitude: Joi.number().precision(6).allow(null).optional().messages({
    'number.base': 'Longitude must be a number.',
  }),
  phone_code: Joi.string().max(10).allow(null, '').optional().messages({
    'string.base': 'Phone code must be a string.',
    'string.max': 'Phone code must be at most 10 characters.',
  }),
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'Is active must be a boolean.',
  }),
});
