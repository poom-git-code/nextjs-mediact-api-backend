import Joi from 'joi';

export const createJobSchema = Joi.object({
  source_schedule_id: Joi.number().optional().allow(null),
  job_title: Joi.string().max(255).required().messages({
    'string.base': 'Job title must be a string.',
    'any.required': 'Job title is required.',
    'string.max': 'Job title must not exceed 255 characters.',
  }),
  job_description: Joi.string().optional().allow(null, '').messages({
    'string.base': 'Job description must be a string.',
  }),
  work_date: Joi.date().required().messages({
    'date.base': 'Work date must be a valid date.',
    'any.required': 'Work date is required.',
  }),
  start_time: Joi.string().required().messages({
    'string.base': 'Start time must be a string.',
    'any.required': 'Start time is required.',
  }),
  end_time: Joi.string().required().messages({
    'string.base': 'End time must be a string.',
    'any.required': 'End time is required.',
  }),
  required_role_id: Joi.number().optional().messages({
    'number.base': 'Required role ID must be a number.',
    // 'any.required': 'Required role ID is required.',
  }),
  required_department_id: Joi.number().required().messages({
    'number.base': 'Required department ID must be a number.',
    'any.required': 'Required department ID is required.',
  }),

  publish_group: Joi.string().valid('hospital', 'part-time', 'system').optional().messages({
    'string.base': 'Publish group must be a string.',
    'any.only': 'Publish group must be one of: hospital, part-time, system.',
  }),

  experience_range: Joi.string().max(50).optional().allow(null, '').messages({
    'string.base': 'Experience range must be a string.',
    'string.max': 'Experience range must not exceed 50 characters.',
  }),

  is_public: Joi.boolean().optional().messages({
    'boolean.base': 'Is public must be a boolean.',
  }),

  status_id: Joi.number().required().messages({
    'number.base': 'Status ID must be a number.',
    'any.required': 'Status ID is required.',
  }),
  max_applicants: Joi.number().optional().allow(null).messages({
    'number.base': 'Max applicants must be a number.',
  }),
  application_deadline: Joi.date().optional().allow(null).messages({
    'date.base': 'Application deadline must be a valid date.',
  }),
  job_fee: Joi.number().precision(2).optional().allow(null).messages({
    'number.base': 'Job fee must be a number.',
    'number.precision': 'Job fee must have at most 2 decimal places.',
  }),
  job_fee_vat_included: Joi.boolean().optional().messages({
    'boolean.base': 'Job fee VAT included must be a boolean.',
  }),
  auto_close_type: Joi.string().valid('time', 'first_applicant', 'max_applicants', 'manual').optional().messages({
    'string.base': 'Auto close type must be a string.',
    'any.only': 'Auto close type must be one of: time, first_applicant, max_applicants, manual.',
  }),
  created_by: Joi.number().optional().allow(null).messages({
    'number.base': 'Created by must be a number.',
  }),
  updated_by: Joi.number().optional().allow(null).messages({
    'number.base': 'Updated by must be a number.',
  }),
});

export const updateJobSchema = createJobSchema.fork(
  [
    'job_title',
    'job_description',
    'work_date',
    'start_time',
    'end_time',
    'required_role_id',
    'required_department_id',
    'publish_group',
    'experience_range',
    'is_public',
    'status_id',
    'max_applicants',
    'application_deadline',
    'job_fee',
    'job_fee_vat_included',
    'auto_close_type'
  ],
  (schema) => schema.optional()
);