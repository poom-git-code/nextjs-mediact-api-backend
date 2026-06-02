import Joi from 'joi';

export const createNewsSchema = Joi.object({
  image_url: Joi.string().uri().max(255).required().messages({
    'string.uri': 'Image URL must be a valid URL.',
    'string.max': 'Image URL must not exceed 255 characters.',
    'any.required': 'Image is required.',
  }),

  title: Joi.string().max(255).required().messages({
    'string.max': 'Title must not exceed 255 characters.',
    'any.required': 'Title is required.',
  }),

  content: Joi.string().required().messages({
    'string.max': 'Content must not exceed 65535 characters.',
    'any.required': 'Content is required.',
  }),

  category: Joi.string().max(255).required().messages({
    'string.max': 'Category must not exceed 255 characters.',
    'any.required': 'Category is required.',
  }),

  role_tags: Joi.string().max(100).allow(null, "").optional().messages({
    'string.max': 'Role tags must not exceed 100 characters.',
  }),

  url: Joi.string().uri().max(255).allow(null, "").optional().messages({
    'string.uri': 'URL must be a valid URL.',
    'string.max': 'URL must not exceed 255 characters.',
  }),

  is_active: Joi.boolean().required().messages({
    'any.required': 'is_active is required.',
  }),
});

export const updateNewsSchema = Joi.object({
  image_url: Joi.string().uri().max(255).required().messages({
    'string.uri': 'Image URL must be a valid URL.',
    'string.max': 'Image URL must not exceed 255 characters.',
    'any.required': 'Image is required.',
  }),

  title: Joi.string().max(255).required().messages({
    'string.max': 'Title must not exceed 255 characters.',
    'any.required': 'Title is required.',
  }),

  content: Joi.string().required().messages({
    'string.max': 'Content must not exceed 65535 characters.',
    'any.required': 'Content is required.',
  }),

  category: Joi.string().max(255).required().messages({
    'string.max': 'Category must not exceed 255 characters.',
    'any.required': 'Category is required.',
  }),

  role_tags: Joi.string().max(100).allow(null, "").optional().messages({
    'string.max': 'Role tags must not exceed 100 characters.',
  }),

  url: Joi.string().uri().max(255).allow(null, "").optional().messages({
    'string.uri': 'URL must be a valid URL.',
    'string.max': 'URL must not exceed 255 characters.',
  }),

  is_active: Joi.boolean().required().messages({
    'any.required': 'is_active is required.',
  }),
});