import Joi from "joi";

export const createDepartmentSupervisorSchema = Joi.object({
  department_id: Joi.number().integer().positive().required().messages({
    "number.base": "Department ID must be a number.",
    "number.integer": "Department ID must be an integer.",
    "number.positive": "Department ID must be a positive number.",
    "any.required": "Department ID is required.",
  }),
  user_id: Joi.number().integer().positive().required().messages({
    "number.base": "User ID must be a number.",
    "number.integer": "User ID must be an integer.",
    "number.positive": "User ID must be a positive number.",
    "any.required": "User ID is required.",
  }),
  role: Joi.string().valid('head', 'assistant', 'secretary').default('head').messages({
    "string.base": "Role must be a string.",
    "any.only": "Role must be one of: head, assistant, secretary.",
  }),
  is_active: Joi.boolean().default(true).messages({
    "boolean.base": "Is Active must be a boolean.",
  }),
});

export const updateDepartmentSupervisorSchema = Joi.object({
  department_id: Joi.number().integer().positive().optional().messages({
    "number.base": "Department ID must be a number.",
    "number.integer": "Department ID must be an integer.",
    "number.positive": "Department ID must be a positive number.",
  }),
  user_id: Joi.number().integer().positive().optional().messages({
    "number.base": "User ID must be a number.",
    "number.integer": "User ID must be an integer.",
    "number.positive": "User ID must be a positive number.",
  }),
  role: Joi.string().valid('head', 'assistant', 'secretary').optional().messages({
    "string.base": "Role must be a string.",
    "any.only": "Role must be one of: head, assistant, secretary.",
  }),
  is_active: Joi.boolean().optional().messages({
    "boolean.base": "Is Active must be a boolean.",
  }),
});
