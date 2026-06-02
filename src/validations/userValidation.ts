import { profile } from "console";
import Joi from "joi";

// Validation for creating a new user
export const createUserSchema = Joi.object({
  // Required
  username: Joi.string().max(255).required().messages({
    "string.base": "Username must be a string.",
    "string.max": "Username must not exceed 255 characters.",
    "any.required": "Username is required.",
  }),
  password: Joi.string().min(8).required().messages({
    "string.base": "Password must be a string.",
    "string.min": "Password must be at least 8 characters.",
    "any.required": "Password is required.",
  }),
  first_name: Joi.string().max(255).required().messages({
    "string.base": "First name must be a string.",
    "string.max": "First name must not exceed 255 characters.",
    "any.required": "First name is required.",
  }),
  last_name: Joi.string().max(255).required().messages({
    "string.base": "Last name must be a string.",
    "string.max": "Last name must not exceed 255 characters.",
    "any.required": "Last name is required.",
  }),
  gender_id: Joi.number().integer().positive().optional().allow(null).messages({
    "number.base": "Gender ID must be a number.",
    "number.integer": "Gender ID must be an integer.",
    "number.positive": "Gender ID must be positive.",
    "any.required": "Gender ID is required.",
  }),
  role_id: Joi.number().integer().positive().optional().allow(null).messages({
    "number.base": "Role ID must be a number.",
    "number.integer": "Role ID must be an integer.",
    "number.positive": "Role ID must be positive.",
    "any.required": "Role ID is required.",
  }),
  status_id: Joi.number().integer().positive().required().messages({
    "number.base": "Status ID must be a number.",
    "number.integer": "Status ID must be an integer.",
    "number.positive": "Status ID must be positive.",
    "any.required": "Status ID is required.",
  }),

  // Optional
  email: Joi.string().email().optional().allow(null, "").messages({
    "string.email": "Email must be a valid email address.",
  }),
  country_code: Joi.string().max(10).optional().allow(null, "").messages({
    "string.base": "Country code must be a string.",
  }),
  phone_number: Joi.string().max(20).optional().allow(null, "").messages({
    "string.base": "Phone number must be a string.",
  }),
  date_of_birth: Joi.date().optional().allow(null, "").messages({
    "date.base": "Date of birth must be a valid date.",
  }),
  profile_picture: Joi.string().optional().allow("", null).messages({
    "string.uri": "Profile picture must be a valid URI.",
  }),
  nickname: Joi.string().max(100).optional().allow(null, "").messages({
    "string.base": "Nickname must be a string.",
    "string.max": "Nickname must not exceed 100 characters.",
  }),
  ID_line: Joi.string().max(100).optional().allow(null, "").messages({
    "string.base": "ID Line must be a string.",
    "string.max": "ID Line must not exceed 100 characters.",
  }),
  need_password_reset: Joi.boolean().optional().default(false),
  is_verified_email: Joi.boolean().optional().default(false),
  is_verified_phone: Joi.boolean().optional().default(false),
  referral_code: Joi.string().optional().allow(null, ""),
  preferences: Joi.object().optional().allow(null, ""),
  id_card_number: Joi.string().max(50).optional().allow(null, ""),
  id_card_url: Joi.string().optional().allow(null, ""),
  passport_number: Joi.string().max(50).optional().allow(null, ""),
  passport_url: Joi.string().optional().allow(null, ""),
  occupation_document_url: Joi.string().optional().allow(null, ""),
  occupation_number: Joi.string().max(50).optional().allow(null, ""),
  occupation_expired: Joi.date().optional().allow(null, "").messages({
    'date.base': 'Occupation expired date must be a valid date.',
  }),
  occupation_passed_unit: Joi.string().optional().allow(null, ""),

  two_factor_enabled: Joi.boolean().optional().default(false),
  failed_login_attempts: Joi.number().integer().min(0).optional().default(0),
  last_password_change: Joi.date().optional().allow(null, ""),
  reset_password_token: Joi.string().max(50).optional().allow(null, ""),
  reset_password_ref: Joi.string().max(50).optional().allow(null, ""),
  reset_password_expires: Joi.date().optional().allow(null, ""),

  status_reason: Joi.string().max(255).optional().allow("", null),
  last_login: Joi.date().optional().allow(null, ""),
  created_by: Joi.number().integer().optional().allow(null, ""),
  updated_by: Joi.number().integer().optional().allow(null, ""),
  role_tags: Joi.array().items(Joi.number().integer()).messages({
    "array.base": "Roles tags must be an array.",
    "array.includes": "Each role tag must be a number.",
  }),
  group_tags: Joi.array().items(
    Joi.alternatives().try(
      Joi.number().integer().positive(),
      Joi.string()
    )
  ).optional().messages({
    "array.base": "Group tags must be an array.",
  }),
});

export const editUserSchema = createUserSchema.fork(["password", "gender_id"], (schema) => {
  if (schema === createUserSchema.extract("password")) {
    return schema.optional().allow(null);
  }
  if (schema === createUserSchema.extract("gender_id")) {
    return Joi.number().integer().optional().allow(null).messages({
      "number.base": "Gender ID must be a number.",
      "number.integer": "Gender ID must be an integer.",
    });
  }
  return schema;
});

// Validation for updating a user
export const updateUserSchema = editUserSchema.fork(["password"], (schema) =>
  schema.optional()
);
