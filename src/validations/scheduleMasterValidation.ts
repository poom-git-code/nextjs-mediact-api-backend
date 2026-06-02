import Joi from 'joi';

export const createScheduleMasterSchema = Joi.object({
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
  date: Joi.date().required().messages({
    'date.base': 'Date must be a valid date.',
    'any.required': 'Date is required.',
  }),
  month: Joi.number().integer().min(1).max(12).required().messages({
    'number.base': 'Month must be a number.',
    'number.integer': 'Month must be an integer.',
    'number.min': 'Month must be at least 1.',
    'number.max': 'Month must be at most 12.',
    'any.required': 'Month is required.',
  }),
  year: Joi.number().integer().min(2000).max(2100).required().messages({
    'number.base': 'Year must be a number.',
    'number.integer': 'Year must be an integer.',
    'number.min': 'Year must be at least 2000.',
    'number.max': 'Year must be at most 2100.',
    'any.required': 'Year is required.',
  }),
  status_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Status ID must be a number.',
    'number.integer': 'Status ID must be an integer.',
    'number.positive': 'Status ID must be a positive number.',
    'any.required': 'Status ID is required.',
  }),
  department_name: Joi.string().max(255).optional().messages({
    'string.base': 'Department name must be a string.',
    'string.max': 'Department name must not exceed 255 characters.',
  }),
  total_working_days: Joi.number().integer().optional().messages({
    'number.base': 'Total working days must be a number.',
    'number.integer': 'Total working days must be an integer.',
    'number.min': 'Total working days must be at least 0.',
    'number.max': 'Total working days must not exceed 31.',
  }),
  working_hours_per_person: Joi.number().precision(2).min(0).max(744).optional().messages({
    'number.base': 'Working hours per person must be a number.',
    'number.min': 'Working hours per person must be at least 0.',
    'number.max': 'Working hours per person must not exceed 744 (24*31).',
    'number.precision': 'Working hours per person must have at most 2 decimal places.',
  }),
  total_dayoffs: Joi.number().integer().optional().messages({
    'number.base': 'Total dayoffs must be a number.',
    'number.integer': 'Total dayoffs must be an integer.',
    'number.min': 'Total dayoffs must be at least 0.',
    'number.max': 'Total dayoffs must not exceed 31.',
  }),
  total_holidays: Joi.number().integer().optional().messages({
    'number.base': 'Total holidays must be a number.',
    'number.integer': 'Total holidays must be an integer.',
    'number.min': 'Total holidays must be at least 0.',
    'number.max': 'Total holidays must not exceed 31.',
  }),
  total_fte: Joi.number().precision(2).min(0).max(9999).optional().messages({
    'number.base': 'Total FTE must be a number.',
    'number.min': 'Total FTE must be at least 0.',
    'number.max': 'Total FTE must not exceed 9999.',
    'number.precision': 'Total FTE must have at most 2 decimal places.',
  }),
  total_shifts_needed: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Total shifts needed must be a number.',
    'number.integer': 'Total shifts needed must be an integer.',
    'number.min': 'Total shifts needed must be at least 0.',
  }),
  total_working_hours_required: Joi.number().precision(2).min(0).optional().messages({
    'number.base': 'Total working hours required must be a number.',
    'number.min': 'Total working hours required must be at least 0.',
    'number.precision': 'Total working hours required must have at most 2 decimal places.',
  }),
  total_members: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Total members must be a number.',
    'number.integer': 'Total members must be an integer.',
    'number.min': 'Total members must be at least 0.',
  }),
  total_regular_hours_available: Joi.number().precision(2).min(0).optional().messages({
    'number.base': 'Total regular hours available must be a number.',
    'number.min': 'Total regular hours available must be at least 0.',
    'number.precision': 'Total regular hours available must have at most 2 decimal places.',
  }),
  total_ot_hours_required: Joi.number().precision(2).min(0).optional().messages({
    'number.base': 'Total OT hours required must be a number.',
    'number.min': 'Total OT hours required must be at least 0.',
    'number.precision': 'Total OT hours required must have at most 2 decimal places.',
  }),
  additional_members_required: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Additional members required must be a number.',
    'number.integer': 'Additional members required must be an integer.',
    'number.min': 'Additional members required must be at least 0.',
  }),
  total_schedule_entries: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Total schedule entries must be a number.',
    'number.integer': 'Total schedule entries must be an integer.',
    'number.min': 'Total schedule entries must be at least 0.',
  }),
  total_actual_hours: Joi.number().precision(2).min(0).optional().messages({
    'number.base': 'Total actual hours must be a number.',
    'number.min': 'Total actual hours must be at least 0.',
    'number.precision': 'Total actual hours must have at most 2 decimal places.',
  }),
  total_shifts_assigned: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Total shifts assigned must be a number.',
    'number.integer': 'Total shifts assigned must be an integer.',
    'number.min': 'Total shifts assigned must be at least 0.',
  }),
  total_vacations: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Total vacations must be a number.',
    'number.integer': 'Total vacations must be an integer.',
    'number.min': 'Total vacations must be at least 0.',
  }),
  total_no_work: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Total no work must be a number.',
    'number.integer': 'Total no work must be an integer.',
    'number.min': 'Total no work must be at least 0.',
  }),
  shift_breakdown: Joi.array().optional().messages({
    'array.base': 'Shift breakdown must be an array.',
  }),
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'Is active must be a boolean.',
  }),
});

export const updateScheduleMasterSchema = Joi.object({
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
  date: Joi.date().optional().messages({
    'date.base': 'Date must be a valid date.',
  }),
  month: Joi.number().integer().min(1).max(12).optional().messages({
    'number.base': 'Month must be a number.',
    'number.integer': 'Month must be an integer.',
    'number.min': 'Month must be at least 1.',
    'number.max': 'Month must be at most 12.',
  }),
  year: Joi.number().integer().min(2000).max(2100).optional().messages({
    'number.base': 'Year must be a number.',
    'number.integer': 'Year must be an integer.',
    'number.min': 'Year must be at least 2000.',
    'number.max': 'Year must be at most 2100.',
  }),
  status_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Status ID must be a number.',
    'number.integer': 'Status ID must be an integer.',
    'number.positive': 'Status ID must be a positive number.',
  }),
  department_name: Joi.string().max(255).optional().messages({
    'string.base': 'Department name must be a string.',
    'string.max': 'Department name must not exceed 255 characters.',
  }),
  total_working_days: Joi.number().integer().min(0).max(31).optional().messages({
    'number.base': 'Total working days must be a number.',
    'number.integer': 'Total working days must be an integer.',
    'number.min': 'Total working days must be at least 0.',
    'number.max': 'Total working days must not exceed 31.',
  }),
  total_operating_days: Joi.number().integer().min(0).max(31).optional().messages({
    'number.base': 'Total operating days must be a number.',
    'number.integer': 'Total operating days must be an integer.',
    'number.min': 'Total operating days must be at least 0.',
    'number.max': 'Total operating days must not exceed 31.',
  }),
  working_hours_per_person: Joi.number().precision(2).min(0).max(744).optional().messages({
    'number.base': 'Working hours per person must be a number.',
    'number.min': 'Working hours per person must be at least 0.',
    'number.max': 'Working hours per person must not exceed 744 (24*31).',
    'number.precision': 'Working hours per person must have at most 2 decimal places.',
  }),
  total_dayoffs: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Total dayoffs must be a number.',
    'number.integer': 'Total dayoffs must be an integer.',
    'number.min': 'Total dayoffs must be at least 0.',
  }),
  total_holidays: Joi.number().integer().min(0).max(31).optional().messages({
    'number.base': 'Total holidays must be a number.',
    'number.integer': 'Total holidays must be an integer.',
    'number.min': 'Total holidays must be at least 0.',
    'number.max': 'Total holidays must not exceed 31.',
  }),
  total_fte: Joi.number().precision(2).min(0).max(9999).optional().messages({
    'number.base': 'Total FTE must be a number.',
    'number.min': 'Total FTE must be at least 0.',
    'number.max': 'Total FTE must not exceed 9999.',
    'number.precision': 'Total FTE must have at most 2 decimal places.',
  }),
  total_shifts_needed: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Total shifts needed must be a number.',
    'number.integer': 'Total shifts needed must be an integer.',
    'number.min': 'Total shifts needed must be at least 0.',
  }),
  total_working_hours_required: Joi.number().precision(2).min(0).optional().messages({
    'number.base': 'Total working hours required must be a number.',
    'number.min': 'Total working hours required must be at least 0.',
    'number.precision': 'Total working hours required must have at most 2 decimal places.',
  }),
  total_members: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Total members must be a number.',
    'number.integer': 'Total members must be an integer.',
    'number.min': 'Total members must be at least 0.',
  }),
  total_regular_hours_available: Joi.number().precision(2).min(0).optional().messages({
    'number.base': 'Total regular hours available must be a number.',
    'number.min': 'Total regular hours available must be at least 0.',
    'number.precision': 'Total regular hours available must have at most 2 decimal places.',
  }),
  total_ot_hours_required: Joi.number().precision(2).min(0).optional().messages({
    'number.base': 'Total OT hours required must be a number.',
    'number.min': 'Total OT hours required must be at least 0.',
    'number.precision': 'Total OT hours required must have at most 2 decimal places.',
  }),
  additional_members_required: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Additional members required must be a number.',
    'number.integer': 'Additional members required must be an integer.',
    'number.min': 'Additional members required must be at least 0.',
  }),
  total_schedule_entries: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Total schedule entries must be a number.',
    'number.integer': 'Total schedule entries must be an integer.',
    'number.min': 'Total schedule entries must be at least 0.',
  }),
  total_actual_hours: Joi.number().precision(2).min(0).optional().messages({
    'number.base': 'Total actual hours must be a number.',
    'number.min': 'Total actual hours must be at least 0.',
    'number.precision': 'Total actual hours must have at most 2 decimal places.',
  }),
  total_shifts_assigned: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Total shifts assigned must be a number.',
    'number.integer': 'Total shifts assigned must be an integer.',
    'number.min': 'Total shifts assigned must be at least 0.',
  }),
  total_vacations: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Total vacations must be a number.',
    'number.integer': 'Total vacations must be an integer.',
    'number.min': 'Total vacations must be at least 0.',
  }),
  total_no_work: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Total no work must be a number.',
    'number.integer': 'Total no work must be an integer.',
    'number.min': 'Total no work must be at least 0.',
  }),
  shift_breakdown: Joi.array().optional().messages({
    'array.base': 'Shift breakdown must be an array.',
  }),
  is_active: Joi.boolean().optional().messages({
    'boolean.base': 'Is active must be a boolean.',
  }),
});