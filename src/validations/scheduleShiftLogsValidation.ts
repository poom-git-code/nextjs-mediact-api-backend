import Joi from "joi";

export const createScheduleShiftLogSchema = Joi.object({
  schedule_shift_id: Joi.number().integer().positive().required().messages({
    "number.base": "Schedule shift ID must be a number.",
    "number.integer": "Schedule shift ID must be an integer.",
    "number.positive": "Schedule shift ID must be a positive number.",
    "any.required": "Schedule shift ID is required.",
  }),
  user_id: Joi.number().integer().positive().required().messages({
    "number.base": "User ID must be a number.",
    "number.integer": "User ID must be an integer.",
    "number.positive": "User ID must be a positive number.",
    "any.required": "User ID is required.",
  }),
    latitude: Joi.number().precision(8).min(-90).max(90).optional().messages({
    "number.base": "Latitude must be a number.",
    "number.min": "Latitude must be between -90 and 90.",
    "number.max": "Latitude must be between -90 and 90.",
  }),
  longitude: Joi.number().precision(8).min(-180).max(180).optional().messages({
    "number.base": "Longitude must be a number.", 
    "number.min": "Longitude must be between -180 and 180.",
    "number.max": "Longitude must be between -180 and 180.",
  }),
  log_type_id: Joi.number().integer().positive().required().messages({
    "number.base": "Log type ID must be a number.",
    "number.integer": "Log type ID must be an integer.",
    "number.positive": "Log type ID must be a positive number.",
    "any.required": "Log type ID is required.",
  }),
  work_type_id: Joi.number().integer().positive().optional().messages({
    "number.base": "Work type ID must be a number.",
    "number.integer": "Work type ID must be an integer.",
    "number.positive": "Work type ID must be a positive number.",
  }),
  log_timestamp: Joi.date().required().messages({
    "date.base": "Log timestamp must be a valid date.",
    "any.required": "Log timestamp is required.",
  }),
  // updated_by: Joi.number().integer().positive().optional().messages({
  //   "number.base": "Updated by must be a number.",
  //   "number.integer": "Updated by must be an integer.",
  //   "number.positive": "Updated by must be a positive number.",
  // }),
  remarks: Joi.string().max(255).optional().messages({
    "string.base": "Remarks must be a string.",
    "string.max": "Remarks must not exceed 255 characters.",
  }),
  normal_hours: Joi.number().precision(2).min(0).optional().messages({
    "number.base": "Normal hours must be a number.",
    "number.min": "Normal hours cannot be negative.",
  }),
  ot_hours: Joi.number().precision(2).min(0).optional().messages({
    "number.base": "OT hours must be a number.",
    "number.min": "OT hours cannot be negative.",
  }),

});

export const updateScheduleShiftLogSchema = Joi.object({
  schedule_shift_id: Joi.number().integer().positive().optional().messages({
    "number.base": "Schedule shift ID must be a number.",
    "number.integer": "Schedule shift ID must be an integer.",
    "number.positive": "Schedule shift ID must be a positive number.",
  }),
  user_id: Joi.number().integer().positive().optional().messages({
    "number.base": "User ID must be a number.",
    "number.integer": "User ID must be an integer.",
    "number.positive": "User ID must be a positive number.",
  }),
    latitude: Joi.number().precision(8).min(-90).max(90).optional().messages({
    "number.base": "Latitude must be a number.",
    "number.min": "Latitude must be between -90 and 90.",
    "number.max": "Latitude must be between -90 and 90.",
  }),
  longitude: Joi.number().precision(8).min(-180).max(180).optional().messages({
    "number.base": "Longitude must be a number.", 
    "number.min": "Longitude must be between -180 and 180.",
    "number.max": "Longitude must be between -180 and 180.",
  }),
  log_type_id: Joi.number().integer().positive().optional().messages({
    "number.base": "Log type ID must be a number.",
    "number.integer": "Log type ID must be an integer.",
    "number.positive": "Log type ID must be a positive number.",
  }),
    work_type_id: Joi.number().integer().positive().optional().messages({
        "number.base": "Work type ID must be a number.",
        "number.integer": "Work type ID must be an integer.",
        "number.positive": "Work type ID must be a positive number.",
    }),
  log_timestamp: Joi.date().optional().messages({
    "date.base": "Log timestamp must be a valid date.",
  }),
  // updated_by: Joi.number().integer().positive().optional().messages({
  //   "number.base": "Updated by must be a number.",
  //   "number.integer": "Updated by must be an integer.",
  //   "number.positive": "Updated by must be a positive number.",
  // }),
  remarks: Joi.string().max(255).optional().messages({
    "string.base": "Remarks must be a string.",
    "string.max": "Remarks must not exceed 255 characters.",
  }),
});
