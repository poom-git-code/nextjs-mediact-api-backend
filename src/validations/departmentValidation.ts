import Joi from "joi";

const timeFormatRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createDepartmentSchema = Joi.object({
  name: Joi.string().max(255).required().messages({
    "string.base": "Name must be a string.",
    "string.max": "Name must not exceed 255 characters.",
    "any.required": "Name is required.",
  }),

  facility_id: Joi.number().integer().positive().required().messages({
    "number.base": "Facility ID must be a number.",
    "number.integer": "Facility ID must be an integer.",
    "number.positive": "Facility ID must be a positive number.",
    "any.required": "Facility ID is required.",
  }),

  type_id: Joi.number().integer().positive().required().messages({
    "number.base": "Type ID must be a number.",
    "number.integer": "Type ID must be an integer.",
    "number.positive": "Type ID must be a positive number.",
    "any.required": "Type ID is required.",
  }),

  role_tags: Joi.string().max(255).required().messages({
    "string.base": "Role tags must be a string.",
    "string.max": "Role tags must not exceed 255 characters.",
    "any.required": "Role tags are required.",
  }),

  is_active: Joi.boolean().required().messages({
    "boolean.base": "isActive must be a boolean.",
    "any.required": "isActive status is required.",
  }),

  abbreviation: Joi.string().max(50).allow(null).optional().messages({
    "string.base": "Abbreviation must be a string.",
    "string.max": "Abbreviation must not exceed 50 characters.",
  }),

  category_id: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .optional()
    .messages({
      "number.base": "Category ID must be a number.",
      "number.integer": "Category ID must be and integer.",
      "number.positive": "Category ID must be a positive number.",
    }),

  sub_category_id: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .optional()
    .messages({
      "number.base": "Sub-category ID must be a number.",
      "number.integer": "Sub-category ID must be an integer.",
      "number.positive": "Sub-category ID must be a positive number.",
    }),
  certificate_id: Joi.number().integer().allow(null).optional(),
});

export const updateDepartmentSchema = Joi.object({
  name: Joi.string().max(255).optional().messages({
    "string.base": "Name must be a string.",
    "string.max": "Name must not exceed 255 characters.",
  }),
  abbreviation: Joi.string().max(50).allow(null, "").optional().messages({
    "string.base": "Abbreviation must be a string.",
    "string.max": "Abbreviation must not exceed 50 characters.",
  }),
  type_id: Joi.number().integer().positive().optional().messages({
    "number.base": "Type ID must be a number.",
    "number.integer": "Type ID must be an integer.",
    "number.positive": "Type ID must be a positive number.",
  }),
  facility_id: Joi.number().integer().positive().optional().messages({
    "number.base": "Facility ID must be a number.",
    "number.integer": "Facility ID must be an integer.",
    "number.positive": "Facility ID must be a positive number.",
  }),
  parent_department_id: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .optional()
    .messages({
      "number.base": "Parent Department ID must be a number.",
      "number.integer": "Parent Department ID must be an integer.",
      "number.positive": "Parent Department ID must be a positive number.",
    }),
  is_active: Joi.boolean().optional().messages({
    "boolean.base": "Is Active must be a boolean.",
  }),
  dayoff_duedate: Joi.number().integer().min(0).optional().messages({
    "number.base": "Day-off due date must be a number.",
    "number.integer": "Day-off due date must be an integer.",
    "number.min": "Day-off due date cannot be negative.",
  }),
  schedule_announcement_date: Joi.number()
    .integer()
    .allow(null)
    .optional()
    .messages({
      "number.base": "Schedule announcement date must be a number.",
      "number.integer": "Schedule announcement date must be an integer.",
    }),
  schedule_announcement_time: Joi.string()
    .pattern(timeFormatRegex)
    .allow(null)
    .optional()
    .messages({
      "string.pattern.base":
        "Schedule announcement time must be in HH:MM format.",
    }),
  day_off_submission_start_date: Joi.number()
    .integer()
    .allow(null)
    .optional()
    .messages({
      "number.base": "Day off submission start date must be a number.",
      "number.integer": "Day off submission start date must be an integer.",
    }),
  day_off_submission_start_time: Joi.string()
    .pattern(timeFormatRegex)
    .allow(null)
    .optional()
    .messages({
      "string.pattern.base":
        "Day off submission start time must be in HH:MM format.",
    }),
  day_off_submission_end_date: Joi.number()
    .integer()
    .allow(null)
    .optional()
    .messages({
      "number.base": "Day off submission end date must be a number.",
      "number.integer": "Day off submission end date must be an integer.",
    }),
  day_off_submission_end_time: Joi.string()
    .pattern(timeFormatRegex)
    .allow(null)
    .optional()
    .messages({
      "string.pattern.base":
        "Day off submission end time must be in HH:MM format.",
    }),
  include_weekend: Joi.boolean().optional().messages({
    "boolean.base": "Include weekend must be a boolean.",
  }),
  include_holiday: Joi.boolean().optional().messages({
    "boolean.base": "Include holiday must be a boolean.",
  }),
  role_tags: Joi.string().max(100).allow(null, "").optional().messages({
    "string.base": "Role tags must be a string.",
    "string.max": "Role tags must not exceed 100 characters.",
  }),
  is_default: Joi.boolean().optional().messages({
    "boolean.base": "Is default must be a boolean.",
  }),
  category_id: Joi.number().integer().allow(null).optional(),
  sub_category_id: Joi.number().integer().allow(null).optional(),
  certificate_id: Joi.number().integer().allow(null).optional(),
});
