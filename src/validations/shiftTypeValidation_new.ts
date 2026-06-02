import Joi from 'joi';

// Validation for creating a new shift type
export const createShiftTypeSchema = Joi.object({
  name: Joi.string().max(255).required().messages({
    'string.base': 'Name must be a string.',
    'string.max': 'Name must not exceed 255 characters.',
    'any.required': 'Name is required.',
  }),
  department_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Department ID must be a number.',
    'number.integer': 'Department ID must be an integer.',
    'number.positive': 'Department ID must be a positive number.',
    'any.required': 'Department ID is required.',
  }),
  facility_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Facility ID must be a number.',
    'number.integer': 'Facility ID must be an integer.',
    'number.positive': 'Facility ID must be a positive number.',
    'any.required': 'Facility ID is required.',
  }),
  start_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .required()
    .messages({
      'string.base': 'Start time must be a string.',
      'string.pattern.base': 'Start time must be in HH:mm:ss format.',
      'any.required': 'Start time is required.',
    }),
  end_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .required()
    .messages({
      'string.base': 'End time must be a string.',
      'string.pattern.base': 'End time must be in HH:mm:ss format.',
      'any.required': 'End time is required.',
    }),
  roles_allowed: Joi.string().required().messages({
    'string.base': 'Roles allowed must be a string.',
    'any.required': 'Roles allowed is required.',
  }),
  short_name: Joi.string().max(50).optional().messages({
    'string.base': 'Short name must be a string.',
    'string.max': 'Short name must not exceed 50 characters.',
  }),
  color_code: Joi.string().max(10).pattern(/^#[0-9A-Fa-f]{6}$/).optional().messages({
    'string.base': 'Color code must be a string.',
    'string.max': 'Color code must not exceed 10 characters.',
    'string.pattern.base': 'Color code must be in hex format (e.g., #FF5733).',
  }),
  total_hours: Joi.number().precision(2).min(0).max(24).optional().messages({
    'number.base': 'Total hours must be a number.',
    'number.min': 'Total hours must be at least 0.',
    'number.max': 'Total hours must not exceed 24.',
    'number.precision': 'Total hours must have at most 2 decimal places.',
  }),
  normal_hours: Joi.number().precision(2).min(0).max(24).optional().messages({
    'number.base': 'Normal hours must be a number.',
    'number.min': 'Normal hours must be at least 0.',
    'number.max': 'Normal hours must not exceed 24.',
    'number.precision': 'Normal hours must have at most 2 decimal places.',
  }),
  ot_hours: Joi.number().precision(2).min(0).max(24).optional().messages({
    'number.base': 'OT hours must be a number.',
    'number.min': 'OT hours must be at least 0.',
    'number.max': 'OT hours must not exceed 24.',
    'number.precision': 'OT hours must have at most 2 decimal places.',
  }),
  count_as_fte: Joi.boolean().default(true).messages({
    'boolean.base': 'Count as FTE must be a boolean.',
  }),
  count_as_working_hour: Joi.boolean().default(true).messages({
    'boolean.base': 'Count as working hour must be a boolean.',
  }),
  min_staff_weekday: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Minimum staff weekday must be a number.',
    'number.integer': 'Minimum staff weekday must be an integer.',
    'number.min': 'Minimum staff weekday must be at least 0.',
  }),
  max_staff_weekday: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Maximum staff weekday must be a number.',
    'number.integer': 'Maximum staff weekday must be an integer.',
    'number.min': 'Maximum staff weekday must be at least 0.',
  }),
  min_staff_weekend: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Minimum staff weekend must be a number.',
    'number.integer': 'Minimum staff weekend must be an integer.',
    'number.min': 'Minimum staff weekend must be at least 0.',
  }),
  max_staff_weekend: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Maximum staff weekend must be a number.',
    'number.integer': 'Maximum staff weekend must be an integer.',
    'number.min': 'Maximum staff weekend must be at least 0.',
  }),
  required_senior_count: Joi.number().integer().min(0).default(0).messages({
    'number.base': 'Required senior count must be a number.',
    'number.integer': 'Required senior count must be an integer.',
    'number.min': 'Required senior count must be at least 0.',
  }),
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'Is active must be a boolean.',
  }),
  role_ids: Joi.array().items(
    Joi.number().integer().positive()
  ).optional().messages({
    'array.base': 'Role IDs must be an array.',
    'number.base': 'Each role ID must be a number.',
    'number.integer': 'Each role ID must be an integer.',
    'number.positive': 'Each role ID must be a positive number.',
  }),
  group_tag_ids: Joi.array().items(
    Joi.number().integer().positive()
  ).optional().messages({
    'array.base': 'Group tag IDs must be an array.',
    'number.base': 'Each group tag ID must be a number.',
    'number.integer': 'Each group tag ID must be an integer.',
    'number.positive': 'Each group tag ID must be a positive number.',
  }),
  group_tags: Joi.array().items(
    Joi.alternatives().try(
      Joi.number().integer().positive(),
      Joi.string()
    )
  ).optional().messages({
    'array.base': 'Group tags must be an array.',
  }),
  allowed_roles: Joi.array().items(
    Joi.number().integer().positive()
  ).optional().messages({
    'array.base': 'Allowed roles must be an array.',
    'number.base': 'Each role ID must be a number.',
    'number.integer': 'Each role ID must be an integer.',
    'number.positive': 'Each role ID must be a positive number.',
  }),
  group_tag_requirements: Joi.object().pattern(
    Joi.string().pattern(/^\d+$/),
    Joi.object({
      min: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Min must be a number.',
        'number.integer': 'Min must be an integer.',
        'number.min': 'Min must be at least 0.',
      }),
      min_count: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Min count must be a number.',
        'number.integer': 'Min count must be an integer.',
        'number.min': 'Min count must be at least 0.',
      }),
      max_count: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Max count must be a number.',
        'number.integer': 'Max count must be an integer.',
        'number.min': 'Max count must be at least 0.',
      }),
    })
  ).optional().messages({
    'object.base': 'Group tag requirements must be an object.',
  }),
  role_requirements: Joi.object().pattern(
    Joi.string().pattern(/^\d+$/),
    Joi.object({
      min_count: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Min count must be a number.',
        'number.integer': 'Min count must be an integer.',
        'number.min': 'Min count must be at least 0.',
      }),
      max_count: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Max count must be a number.',
        'number.integer': 'Max count must be an integer.',
        'number.min': 'Max count must be at least 0.',
      }),
      min_count_weekday: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Min count weekday must be a number.',
        'number.integer': 'Min count weekday must be an integer.',
        'number.min': 'Min count weekday must be at least 0.',
      }),
      max_count_weekday: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Max count weekday must be a number.',
        'number.integer': 'Max count weekday must be an integer.',
        'number.min': 'Max count weekday must be at least 0.',
      }),
      min_count_weekend: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Min count weekend must be a number.',
        'number.integer': 'Min count weekend must be an integer.',
        'number.min': 'Min count weekend must be at least 0.',
      }),
      max_count_weekend: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Max count weekend must be a number.',
        'number.integer': 'Max count weekend must be an integer.',
        'number.min': 'Max count weekend must be at least 0.',
      }),
    })
  ).optional().messages({
    'object.base': 'Role requirements must be an object.',
  }),
});

// Validation for updating a shift type
export const updateShiftTypeSchema = Joi.object({
  name: Joi.string().max(255).optional().messages({
    'string.base': 'Name must be a string.',
    'string.max': 'Name must not exceed 255 characters.',
  }),
  department_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Department ID must be a number.',
    'number.integer': 'Department ID must be an integer.',
    'number.positive': 'Department ID must be a positive number.',
  }),
  facility_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Facility ID must be a number.',
    'number.integer': 'Facility ID must be an integer.',
    'number.positive': 'Facility ID must be a positive number.',
  }),
  start_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .optional()
    .messages({
      'string.base': 'Start time must be a string.',
      'string.pattern.base': 'Start time must be in HH:mm:ss format.',
    }),
  end_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .optional()
    .messages({
      'string.base': 'End time must be a string.',
      'string.pattern.base': 'End time must be in HH:mm:ss format.',
    }),
  roles_allowed: Joi.string().optional().messages({
    'string.base': 'Roles allowed must be a string.',
  }),
  short_name: Joi.string().max(50).optional().messages({
    'string.base': 'Short name must be a string.',
    'string.max': 'Short name must not exceed 50 characters.',
  }),
  color_code: Joi.string().max(10).pattern(/^#[0-9A-Fa-f]{6}$/).optional().messages({
    'string.base': 'Color code must be a string.',
    'string.max': 'Color code must not exceed 10 characters.',
    'string.pattern.base': 'Color code must be in hex format (e.g., #FF5733).',
  }),
  total_hours: Joi.number().precision(2).min(0).max(24).optional().messages({
    'number.base': 'Total hours must be a number.',
    'number.min': 'Total hours must be at least 0.',
    'number.max': 'Total hours must not exceed 24.',
    'number.precision': 'Total hours must have at most 2 decimal places.',
  }),
  normal_hours: Joi.number().precision(2).min(0).max(24).optional().messages({
    'number.base': 'Normal hours must be a number.',
    'number.min': 'Normal hours must be at least 0.',
    'number.max': 'Normal hours must not exceed 24.',
    'number.precision': 'Normal hours must have at most 2 decimal places.',
  }),
  ot_hours: Joi.number().precision(2).min(0).max(24).optional().messages({
    'number.base': 'OT hours must be a number.',
    'number.min': 'OT hours must be at least 0.',
    'number.max': 'OT hours must not exceed 24.',
    'number.precision': 'OT hours must have at most 2 decimal places.',
  }),
  count_as_fte: Joi.boolean().optional().messages({
    'boolean.base': 'Count as FTE must be a boolean.',
  }),
  count_as_working_hour: Joi.boolean().optional().messages({
    'boolean.base': 'Count as working hour must be a boolean.',
  }),
  min_staff_weekday: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Minimum staff weekday must be a number.',
    'number.integer': 'Minimum staff weekday must be an integer.',
    'number.min': 'Minimum staff weekday must be at least 0.',
  }),
  max_staff_weekday: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Maximum staff weekday must be a number.',
    'number.integer': 'Maximum staff weekday must be an integer.',
    'number.min': 'Maximum staff weekday must be at least 0.',
  }),
  min_staff_weekend: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Minimum staff weekend must be a number.',
    'number.integer': 'Minimum staff weekend must be an integer.',
    'number.min': 'Minimum staff weekend must be at least 0.',
  }),
  max_staff_weekend: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Maximum staff weekend must be a number.',
    'number.integer': 'Maximum staff weekend must be an integer.',
    'number.min': 'Maximum staff weekend must be at least 0.',
  }),
  required_senior_count: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Required senior count must be a number.',
    'number.integer': 'Required senior count must be an integer.',
    'number.min': 'Required senior count must be at least 0.',
  }),
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'Is active must be a boolean.',
  }),
  role_ids: Joi.array().items(
    Joi.number().integer().positive()
  ).optional().messages({
    'array.base': 'Role IDs must be an array.',
    'number.base': 'Each role ID must be a number.',
    'number.integer': 'Each role ID must be an integer.',
    'number.positive': 'Each role ID must be a positive number.',
  }),
  group_tag_ids: Joi.array().items(
    Joi.number().integer().positive()
  ).optional().messages({
    'array.base': 'Group tag IDs must be an array.',
    'number.base': 'Each group tag ID must be a number.',
    'number.integer': 'Each group tag ID must be an integer.',
    'number.positive': 'Each group tag ID must be a positive number.',
  }),
  group_tags: Joi.array().items(
    Joi.alternatives().try(
      Joi.number().integer().positive(),
      Joi.string()
    )
  ).optional().messages({
    'array.base': 'Group tags must be an array.',
  }),
  allowed_roles: Joi.array().items(
    Joi.number().integer().positive()
  ).optional().messages({
    'array.base': 'Allowed roles must be an array.',
    'number.base': 'Each role ID must be a number.',
    'number.integer': 'Each role ID must be an integer.',
    'number.positive': 'Each role ID must be a positive number.',
  }),
  group_tag_requirements: Joi.object().pattern(
    Joi.string().pattern(/^\d+$/),
    Joi.object({
      min: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Min must be a number.',
        'number.integer': 'Min must be an integer.',
        'number.min': 'Min must be at least 0.',
      }),
      min_count: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Min count must be a number.',
        'number.integer': 'Min count must be an integer.',
        'number.min': 'Min count must be at least 0.',
      }),
      max_count: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Max count must be a number.',
        'number.integer': 'Max count must be an integer.',
        'number.min': 'Max count must be at least 0.',
      }),
    })
  ).optional().messages({
    'object.base': 'Group tag requirements must be an object.',
  }),
  role_requirements: Joi.object().pattern(
    Joi.string().pattern(/^\d+$/),
    Joi.object({
      min_count: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Min count must be a number.',
        'number.integer': 'Min count must be an integer.',
        'number.min': 'Min count must be at least 0.',
      }),
      max_count: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Max count must be a number.',
        'number.integer': 'Max count must be an integer.',
        'number.min': 'Max count must be at least 0.',
      }),
      min_count_weekday: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Min count weekday must be a number.',
        'number.integer': 'Min count weekday must be an integer.',
        'number.min': 'Min count weekday must be at least 0.',
      }),
      max_count_weekday: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Max count weekday must be a number.',
        'number.integer': 'Max count weekday must be an integer.',
        'number.min': 'Max count weekday must be at least 0.',
      }),
      min_count_weekend: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Min count weekend must be a number.',
        'number.integer': 'Min count weekend must be an integer.',
        'number.min': 'Min count weekend must be at least 0.',
      }),
      max_count_weekend: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Max count weekend must be a number.',
        'number.integer': 'Max count weekend must be an integer.',
        'number.min': 'Max count weekend must be at least 0.',
      }),
    })
  ).optional().messages({
    'object.base': 'Role requirements must be an object.',
  }),
});