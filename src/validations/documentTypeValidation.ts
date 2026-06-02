import Joi from 'joi';

// Create DocumentType validation schema
export const createDocumentTypeSchema = Joi.object({
  type_code: Joi.string().max(50).required().messages({
    'string.base': 'Type code must be a string',
    'string.max': 'Type code must not exceed 50 characters',
    'any.required': 'Type code is required'
  }),
  type_name: Joi.string().max(100).required().messages({
    'string.base': 'Type name must be a string',
    'string.max': 'Type name must not exceed 100 characters',
    'any.required': 'Type name is required'
  }),
  description: Joi.string().max(255).optional().allow(null, '').messages({
    'string.base': 'Description must be a string',
    'string.max': 'Description must not exceed 255 characters'
  }),
  is_active: Joi.boolean().optional().default(true).messages({
    'boolean.base': 'Is active must be a boolean'
  })
});

// Update DocumentType validation schema
export const updateDocumentTypeSchema = Joi.object({
  type_code: Joi.string().max(50).optional().messages({
    'string.base': 'Type code must be a string',
    'string.max': 'Type code must not exceed 50 characters'
  }),
  type_name: Joi.string().max(100).optional().messages({
    'string.base': 'Type name must be a string',
    'string.max': 'Type name must not exceed 100 characters'
  }),
  description: Joi.string().max(255).optional().allow(null, '').messages({
    'string.base': 'Description must be a string',
    'string.max': 'Description must not exceed 255 characters'
  }),
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'Is active must be a boolean'
  })
});

// Get DocumentTypes query validation
export const getDocumentTypesQuerySchema = Joi.object({
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'Is active must be a boolean'
  }),
  search: Joi.string().optional().messages({
    'string.base': 'Search must be a string'
  })
});