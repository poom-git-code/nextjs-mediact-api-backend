import * as Joi from "joi";

export const createEventSchema = Joi.object({
  image_url: Joi.string().uri().max(255).required().messages({
    "string.uri": "Image URL must be a valid URL.",
    "string.max": "Image URL must not exceed 255 characters.",
    "any.required": "Image is required.",
  }),
  title: Joi.string().max(255).required().messages({
    "string.empty": "Title is required.",
    "string.max": "Title must not exceed 255 characters.",
    "any.required": "Title is required.",
  }),
  description: Joi.string().required().messages({
    "string.empty": "Description is required.",
    "any.required": "Description is required.",
    "string.max": "Description must not exceed 65,535 characters."
  }),
  content: Joi.string().required().messages({
    "string.empty": "Content is required.",
    "any.required": "Content is required.",
    "string.max": "Content must not exceed 65,535 characters."
  }),
  start_date: Joi.date().required().messages({
    "date.base": "Start date must be a valid date.",
    "any.required": "Start date is required.",
  }),
  end_date: Joi.date().required().messages({
    "date.base": "End date must be a valid date.",
    "any.required": "End date is required.",
  }),
  role_tags: Joi.string().max(100).required().messages({
    "string.max": "Role tags must not exceed 100 characters.",
    "string.empty": "Role tags are required.",
    "any.required": "Role tags are required.",
  }),
  location: Joi.string().max(255).required().messages({
    "string.max": "Location must not exceed 255 characters.",
    "string.empty": "Location is required.",
    "any.required": "Location is required.",
  }),
  max_participants: Joi.number().integer().positive().allow(null).optional().messages({
    "number.base": "Maximum participants must be a number.",
    "number.integer": "Maximum participants must be an integer.",
    "number.positive": "Maximum participants must be a positive number.",
  }),
  url: Joi.string().uri().max(255).allow(null, "").optional().messages({
    "string.uri": "Event URL must be a valid URL.",
    "string.max": "Event URL must not exceed 255 characters.",
  }),
  contact_name: Joi.string().max(255).allow(null, "").optional().messages({
    "string.max": "Contact name must not exceed 255 characters.",
  }),
  contact_email: Joi.string().email({ tlds: { allow: false } }).max(255).allow(null, "").optional().messages({
    "string.email": "Contact email must be a valid email address.",
    "string.max": "Contact email must not exceed 255 characters.",
  }),
  contact_phone: Joi.string().max(100).allow(null, "").optional().messages({
    "string.max": "Contact phone must not exceed 100 characters.",
  }),
  is_active: Joi.boolean().required().messages({
    "boolean.base": "isActive must be a boolean.",
    "any.required": "isActive is required.",
  }),
  credits: Joi.array().items(Joi.object({
    credit_type_id: Joi.number().integer().required(),
    score: Joi.number().positive().required()
  })).optional(),
});

export const updateEventSchema = Joi.object({
  image_url: Joi.string().uri().max(255).required().messages({
    "string.uri": "Image URL must be a valid URL.",
    "string.max": "Image URL must not exceed 255 characters.",
    "any.required": "Image is required.",
  }),
  title: Joi.string().max(255).required().messages({
    "string.empty": "Title is required.",
    "string.max": "Title must not exceed 255 characters.",
    "any.required": "Title is required.",
  }),
  description: Joi.string().required().messages({
    "string.empty": "Description is required.",
    "any.required": "Description is required.",
    "string.max": "Description must not exceed 65,535 characters."
  }),
  content: Joi.string().required().messages({
    "string.empty": "Content is required.",
    "any.required": "Content is required.",
    "string.max": "Content must not exceed 65,535 characters."
  }),
  start_date: Joi.date().required().messages({
    "date.base": "Start date must be a valid date.",
    "any.required": "Start date is required.",
  }),
  end_date: Joi.date().required().messages({
    "date.base": "End date must be a valid date.",
    "any.required": "End date is required.",
  }),
  role_tags: Joi.string().max(100).required().messages({
    "string.max": "Role tags must not exceed 100 characters.",
    "string.empty": "Role tags are required.",
    "any.required": "Role tags are required.",
  }),
  location: Joi.string().max(255).required().messages({
    "string.max": "Location must not exceed 255 characters.",
    "string.empty": "Location is required.",
    "any.required": "Location is required.",
  }),
  max_participants: Joi.number().integer().positive().allow(null).optional().messages({
    "number.base": "Maximum participants must be a number.",
    "number.integer": "Maximum participants must be an integer.",
    "number.positive": "Maximum participants must be a positive number.",
  }),
  url: Joi.string().uri().max(255).allow(null, "").optional().messages({
    "string.uri": "Event URL must be a valid URL.",
    "string.max": "Event URL must not exceed 255 characters.",
  }),
  contact_name: Joi.string().max(255).allow(null, "").optional().messages({
    "string.max": "Contact name must not exceed 255 characters.",
  }),
  contact_email: Joi.string().email({ tlds: { allow: false } }).max(255).allow(null, "").optional().messages({
    "string.email": "Contact email must be a valid email address.",
    "string.max": "Contact email must not exceed 255 characters.",
  }),
  contact_phone: Joi.string().max(100).allow(null, "").optional().messages({
    "string.max": "Contact phone must not exceed 100 characters.",
  }),
  is_active: Joi.boolean().required().messages({
    "boolean.base": "isActive must be a boolean.",
    "any.required": "isActive is required.",
  }),
  credits: Joi.array().items(Joi.object({
    credit_type_id: Joi.number().integer().required(),
    score: Joi.number().positive().required()
  })).optional(),
});
