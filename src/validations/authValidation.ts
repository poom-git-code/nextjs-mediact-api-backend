import { ro } from "date-fns/locale";
import Joi from "joi";

export const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required().messages({
    "string.base": "Username must be a string.",
    "string.min": "Username must be at least 3 characters.",
    "string.max": "Username must not exceed 50 characters.",
    "any.required": "Username is required.",
  }),
  password: Joi.string().min(6).max(255).required().messages({
    "string.base": "Password must be a string.",
    "string.min": "Password must be at least 6 characters.",
    "string.max": "Password must not exceed 255 characters.",
    "any.required": "Password is required.",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email address.",
    "any.required": "Email is required.",
  }),
  first_name: Joi.string().max(100).required().messages({
    "string.base": "First name must be a string.",
    "string.max": "First name must not exceed 100 characters.",
    "any.required": "First name is required.",
  }),
  last_name: Joi.string().max(100).required().messages({
    "string.base": "Last name must be a string.",
    "string.max": "Last name must not exceed 100 characters.",
    "any.required": "Last name is required.",
  }),
  phone_number: Joi.string().max(20).required().messages({
    // 'string.base': 'Phone number must be a string.',
    "string.max": "Phone number must not exceed 20 characters.",
    "any.required": "Phone number is required.",
  }),
  role_id: Joi.number().integer().positive().required().messages({
    "number.base": "Role ID must be a number.",
    "number.integer": "Role ID must be an integer.",
    "number.positive": "Role ID must be a positive number.",
    "any.required": "Role ID is required.",
  }),
});

export const registerV2Schema = Joi.object({
  role_id: Joi.number().integer().positive().required().messages({
    "number.base": "Role ID must be a number.",
    "number.integer": "Role ID must be an integer.",
    "number.positive": "Role ID must be a positive number.",
    "any.required": "Role ID is required.",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email address.",
    "any.required": "Email is required.",
  }),
  password: Joi.string().min(6).max(255).required().messages({
    "string.base": "Password must be a string.",
    "string.min": "Password must be at least 6 characters.",
    "string.max": "Password must not exceed 255 characters.",
    "any.required": "Password is required.",
  }),
  phone_number: Joi.string().max(20).required().messages({
    "string.max": "Phone number must not exceed 20 characters.",
    "any.required": "Phone number is required.",
  }),
  is_verified_email: Joi.boolean().default(true).messages({
    "boolean.base": "Email verification status must be a boolean.",
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.email": "Invalid email format",
  }),
  password: Joi.string()
    .required()
    .messages({ "any.required": "Password is required" }),
});

export const loginV2Schema = Joi.object({
  identifier: Joi.string().required().messages({
    "any.required": "Identifier (email or username) is required",
  }),
  password: Joi.string()
    .required()
    .messages({ "any.required": "Password is required" }),
});

export const requestResetSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.email": "Invalid email format",
  }),
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().required().messages({
    "any.required": "Email is required",
    "string.email": "Invalid email format",
  }),
  newPassword: Joi.string().min(6).required().messages({
    "any.required": "New password is required",
    "string.min": "Password must be at least 6 characters",
  }),
});

export const resetPasswordNeedSchema = Joi.object({
  userId: Joi.number().integer().positive().required().messages({
    "any.required": "User ID is required",
    "number.base": "User ID must be a number",
    "number.integer": "User ID must be an integer",
    "number.positive": "User ID must be a positive number",
  }),
  newPassword: Joi.string().min(6).required().messages({
    "any.required": "New password is required",
    "string.min": "Password must be at least 6 characters",
  }),
});
