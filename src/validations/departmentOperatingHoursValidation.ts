import Joi from "joi";

export const createDepartmentOperatingHoursSchema = Joi.object({
  department_id: Joi.number().integer().positive().required().messages({
    "number.base": "Department ID must be a number.",
    "number.integer": "Department ID must be an integer.",
    "number.positive": "Department ID must be a positive number.",
    "any.required": "Department ID is required.",
  }),
  weekday: Joi.string().valid('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun').required().messages({
    "string.base": "Weekday must be a string.",
    "any.only": "Weekday must be one of: mon, tue, wed, thu, fri, sat, sun.",
    "any.required": "Weekday is required.",
  }),
  start_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).required().messages({
    "string.base": "Start time must be a string.",
    "string.pattern.base": "Start time must be in HH:MM:SS format.",
    "any.required": "Start time is required.",
  }),
  end_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).required().messages({
    "string.base": "End time must be a string.",
    "string.pattern.base": "End time must be in HH:MM:SS format.",
    "any.required": "End time is required.",
  }),
  is_active: Joi.boolean().default(true).messages({
    "boolean.base": "Is Active must be a boolean.",
  }),
});

export const updateDepartmentOperatingHoursSchema = Joi.object({
  department_id: Joi.number().integer().positive().optional().messages({
    "number.base": "Department ID must be a number.",
    "number.integer": "Department ID must be an integer.",
    "number.positive": "Department ID must be a positive number.",
  }),
  weekday: Joi.string().valid('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun').optional().messages({
    "string.base": "Weekday must be a string.",
    "any.only": "Weekday must be one of: mon, tue, wed, thu, fri, sat, sun.",
  }),
  start_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).optional().messages({
    "string.base": "Start time must be a string.",
    "string.pattern.base": "Start time must be in HH:MM:SS format.",
  }),
  end_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).optional().messages({
    "string.base": "End time must be a string.",
    "string.pattern.base": "End time must be in HH:MM:SS format.",
  }),
  is_active: Joi.boolean().optional().messages({
    "boolean.base": "Is Active must be a boolean.",
  }),
});
