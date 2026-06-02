import Joi from "joi";

export const createRoleSchema = Joi.object({
  name: Joi.string().max(50).required().messages({
    "string.base": "Name must be a string.",
    "string.max": "Name must not exceed 50 characters.",
    "any.required": "Name is required.",
  }),
  description: Joi.string().allow(null, "").optional().messages({
    "string.base": "Description must be a string.",
  }),
  is_active: Joi.boolean().required().messages({
    "boolean.base": "isActive must be a boolean (true or false).",
    "any.required": "isActive is required.",
  }),
});

export const updateRoleSchema = Joi.object({
  name: Joi.string().max(50).optional().messages({
    "string.base": "Name must be a string.",
    "string.max": "Name must not exceed 50 characters.",
  }),
  description: Joi.string().allow(null, "").optional().messages({
    "string.base": "Description must be a string.",
  }),
  is_active: Joi.boolean().required().messages({
    "boolean.base": "isActive must be a boolean (true or false).",
    "any.required": "isActive is required.",
  }),
});
