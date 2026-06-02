import Joi from 'joi';

export const createDutyTypeSchema = Joi.object({
  code: Joi.string().max(50).required().messages({
    'string.base': 'Code must be a string.',
    'string.max': 'Code must not exceed 50 characters.',
    'any.required': 'Code is required.',
  }),
  name: Joi.string().max(100).required().messages({
    'string.base': 'Name must be a string.',
    'string.max': 'Name must not exceed 100 characters.',
    'any.required': 'Name is required.',
  }),
  description: Joi.string().optional().allow(null, '').messages({
    'string.base': 'Description must be a string.',
  }),
  is_active: Joi.boolean().optional().default(true).messages({
    'boolean.base': 'Is active must be a boolean.',
  }),
  created_by: Joi.number().integer().optional().allow(null).messages({
    'number.base': 'Created by must be a number.',
    'number.integer': 'Created by must be an integer.',
  }),
  updated_by: Joi.number().integer().optional().allow(null).messages({
    'number.base': 'Updated by must be a number.',
    'number.integer': 'Updated by must be an integer.',
  }),
});

export const updateDutyTypeSchema = Joi.object({
  code: Joi.string().max(50).optional().messages({
    'string.base': 'Code must be a string.',
    'string.max': 'Code must not exceed 50 characters.',
  }),
  name: Joi.string().max(100).optional().messages({
    'string.base': 'Name must be a string.',
    'string.max': 'Name must not exceed 100 characters.',
  }),
  description: Joi.string().optional().allow(null, '').messages({
    'string.base': 'Description must be a string.',
  }),
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'Is active must be a boolean.',
  }),
  updated_by: Joi.number().integer().optional().allow(null).messages({
    'number.base': 'Updated by must be a number.',
    'number.integer': 'Updated by must be an integer.',
  }),
});

export const getDutyTypeFiltersSchema = Joi.object({
  code: Joi.string().optional().messages({
    'string.base': 'Code must be a string.',
  }),
  name: Joi.string().optional().messages({
    'string.base': 'Name must be a string.',
  }),
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'Is active must be a boolean.',
  }),
  search: Joi.string().optional().messages({
    'string.base': 'Search must be a string.',
  }),
  limit: Joi.number().integer().min(1).max(1000).optional().default(100).messages({
    'number.base': 'Limit must be a number.',
    'number.integer': 'Limit must be an integer.',
    'number.min': 'Limit must be at least 1.',
    'number.max': 'Limit must be at most 1000.',
  }),
  offset: Joi.number().integer().min(0).optional().default(0).messages({
    'number.base': 'Offset must be a number.',
    'number.integer': 'Offset must be an integer.',
    'number.min': 'Offset must be at least 0.',
  }),
});

export const bulkUpdateDutyTypesSchema = Joi.object({
  duty_type_ids: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
    'array.base': 'Duty type IDs must be an array.',
    'array.min': 'At least one duty type ID is required.',
    'any.required': 'Duty type IDs are required.',
  }),
  updates: Joi.object({
    is_active: Joi.boolean().optional().messages({
      'boolean.base': 'Is active must be a boolean.',
    }),
    name: Joi.string().max(100).optional().messages({
      'string.base': 'Name must be a string.',
      'string.max': 'Name must not exceed 100 characters.',
    }),
    description: Joi.string().optional().allow(null, '').messages({
      'string.base': 'Description must be a string.',
    }),
  }).min(1).required().messages({
    'object.min': 'At least one update field is required.',
    'any.required': 'Updates object is required.',
  }),
});

export const getDutyTypeByCodeSchema = Joi.object({
  code: Joi.string().max(50).required().messages({
    'string.base': 'Code must be a string.',
    'string.max': 'Code must not exceed 50 characters.',
    'any.required': 'Code is required.',
  }),
});

export const validateDutyTypeExistsSchema = Joi.object({
  codes: Joi.array().items(Joi.string().max(50)).min(1).required().messages({
    'array.base': 'Codes must be an array.',
    'array.min': 'At least one code is required.',
    'any.required': 'Codes are required.',
  }),
});
