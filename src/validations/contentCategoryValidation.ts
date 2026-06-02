import Joi from "joi";

export const createContentCategorySchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.base": "Name must be a string.",
    "string.empty": "Name is required.",
    "any.required": "Name is required.",
  }),
  description: Joi.string().allow("").optional().messages({
    "string.base": "Description must be a string.",
  }),
  is_active: Joi.boolean().optional().messages({
    "boolean.base": "is_active must be a boolean.",
  }),
  sort_order: Joi.number().integer().optional().messages({
    "number.base": "Sort order must be a number.",
    "number.integer": "Sort order must be an integer.",
  }),
});

export const updateContentCategorySchema = Joi.object({
  name: Joi.string().trim().optional().messages({
    "string.base": "Name must be a string.",
    "string.empty": "Name cannot be empty.",
  }),
  description: Joi.string().allow("").optional().messages({
    "string.base": "Description must be a string.",
  }),
  is_active: Joi.boolean().optional().messages({
    "boolean.base": "is_active must be a boolean.",
  }),
  sort_order: Joi.number().integer().optional().messages({
    "number.base": "Sort order must be a number.",
    "number.integer": "Sort order must be an integer.",
  }),
});