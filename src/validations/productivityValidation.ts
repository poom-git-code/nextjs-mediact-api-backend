import Joi from 'joi';

/// Dashboard validation schema
export const productivityDashboardSchema = Joi.object({
  department_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Department ID must be a number',
    'number.integer': 'Department ID must be an integer',
    'number.positive': 'Department ID must be positive',
    'any.required': 'Department ID is required'
  }),

  shift_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
    'string.pattern.base': 'Shift date must be in YYYY-MM-DD format',
    'any.required': 'Shift date is required'
  }),

  shift_type_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Shift type ID must be a number',
    'number.integer': 'Shift type ID must be an integer',
    'number.positive': 'Shift type ID must be positive',
  })
});

export const facilityDailySummarySchema = Joi.object({
  facility_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Facility ID must be a number',
    'number.integer': 'Facility ID must be an integer',
    'number.positive': 'Facility ID must be positive',
    'any.required': 'Facility ID is required'
  }),
  shift_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
    'string.pattern.base': 'Shift date must be in YYYY-MM-DD format',
    'any.required': 'Shift date is required'
  }),
});

export const productivityGraphSchema = Joi.object({
  department_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Department ID must be a number',
    'number.integer': 'Department ID must be an integer',
    'number.positive': 'Department ID must be positive',
  }),

  facility_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Facility ID must be a number',
    'number.integer': 'Facility ID must be an integer',
    'number.positive': 'Facility ID must be positive',
  }),

  start_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
    'string.pattern.base': 'Start date must be in YYYY-MM-DD format',
    'any.required': 'Start date is required'
  }),

  end_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
    'string.pattern.base': 'End date must be in YYYY-MM-DD format',
    'any.required': 'End date is required'
  })
}).or('department_id', 'facility_id');

export const createProductivityRecordSchema = Joi.object({
  department_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Department ID must be a number',
    'number.integer': 'Department ID must be an integer',
    'number.positive': 'Department ID must be positive',
    'any.required': 'Department ID is required'
  }),

  shift_date: Joi.date().required().messages({
    'date.base': 'Shift date must be a valid date',
    'any.required': 'Shift date is required'
  }),

  shift_type_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Shift type ID must be a number',
    'number.integer': 'Shift type ID must be an integer',
    'number.positive': 'Shift type ID must be positive',
    'any.required': 'Shift type ID is required'
  }),

  total_beds: Joi.number().integer().min(0).default(0).messages({
    'number.base': 'Total beds must be a number',
    'number.integer': 'Total beds must be an integer',
    'number.min': 'Total beds cannot be negative'
  }),

  critical_patients: Joi.number().integer().min(0).default(0).messages({
    'number.base': 'Critical patients must be a number',
    'number.integer': 'Critical patients must be an integer',
    'number.min': 'Critical patients cannot be negative'
  }),

  severe_patients: Joi.number().integer().min(0).default(0).messages({
    'number.base': 'Severe patients must be a number',
    'number.integer': 'Severe patients must be an integer',
    'number.min': 'Severe patients cannot be negative'
  }),

  semi_critical_patients: Joi.number().integer().min(0).default(0).messages({
    'number.base': 'Semi-critical patients must be a number',
    'number.integer': 'Semi-critical patients must be an integer',
    'number.min': 'Semi-critical patients cannot be negative'
  }),

  moderate_patients: Joi.number().integer().min(0).default(0).messages({
    'number.base': 'Moderate patients must be a number',
    'number.integer': 'Moderate patients must be an integer',
    'number.min': 'Moderate patients cannot be negative'
  }),

  convalescing_patients: Joi.number().integer().min(0).default(0).messages({
    'number.base': 'Convalescing patients must be a number',
    'number.integer': 'Convalescing patients must be an integer',
    'number.min': 'Convalescing patients cannot be negative'
  }),

  admitted_patients: Joi.number().integer().min(0).default(0).messages({
    'number.base': 'Admitted patients must be a number',
    'number.integer': 'Admitted patients must be an integer',
    'number.min': 'Admitted patients cannot be negative'
  }),

  discharged_patients: Joi.number().integer().min(0).default(0).messages({
    'number.base': 'Discharged patients must be a number',
    'number.integer': 'Discharged patients must be an integer',
    'number.min': 'Discharged patients cannot be negative'
  }),

  total_patients_calculated: Joi.number().integer().min(0).required().messages({
    'number.base': 'Total patients calculated must be a number',
    'number.integer': 'Total patients calculated must be an integer',
    'number.min': 'Total patients calculated cannot be negative',
    'any.required': 'Total patients calculated is required'
  }),

  free_beds_calculated: Joi.number().integer().min(0).required().messages({
    'number.base': 'Free beds calculated must be a number',
    'number.integer': 'Free beds calculated must be an integer',
    'number.min': 'Free beds calculated cannot be negative',
    'any.required': 'Free beds calculated is required'
  }),

  bed_occupancy_rate: Joi.number().min(0).max(9999.99).optional().messages({
    'number.base': 'Bed occupancy rate must be a number',
    'number.min': 'Bed occupancy rate cannot be negative',
    'number.max': 'Bed occupancy rate cannot exceed 9999.99',
  }),

  productivity_score: Joi.number().min(0).max(99999999.99).required().messages({
    'number.base': 'Productivity score must be a number',
    'number.min': 'Productivity score cannot be negative',
    'number.max': 'Productivity score cannot exceed 99999999.99',
    'any.required': 'Productivity score is required'
  }),

  created_by: Joi.number().integer().positive().optional().messages({
    'number.base': 'Created by must be a number',
    'number.integer': 'Created by must be an integer',
    'number.positive': 'Created by must be positive'
  }),

  updated_by: Joi.number().integer().positive().optional().messages({
    'number.base': 'Updated by must be a number',
    'number.integer': 'Updated by must be an integer',
    'number.positive': 'Updated by must be positive'
  })
});

export const updateProductivityRecordSchema = Joi.object({
  department_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Department ID must be a number',
    'number.integer': 'Department ID must be an integer',
    'number.positive': 'Department ID must be positive'
  }),

  shift_date: Joi.date().optional().messages({
    'date.base': 'Shift date must be a valid date'
  }),

  shift_type_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Shift type ID must be a number',
    'number.integer': 'Shift type ID must be an integer',
    'number.positive': 'Shift type ID must be positive'
  }),

  total_beds: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Total beds must be a number',
    'number.integer': 'Total beds must be an integer',
    'number.min': 'Total beds cannot be negative'
  }),

  critical_patients: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Critical patients must be a number',
    'number.integer': 'Critical patients must be an integer',
    'number.min': 'Critical patients cannot be negative'
  }),

  severe_patients: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Severe patients must be a number',
    'number.integer': 'Severe patients must be an integer',
    'number.min': 'Severe patients cannot be negative'
  }),

  semi_critical_patients: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Semi-critical patients must be a number',
    'number.integer': 'Semi-critical patients must be an integer',
    'number.min': 'Semi-critical patients cannot be negative'
  }),

  moderate_patients: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Moderate patients must be a number',
    'number.integer': 'Moderate patients must be an integer',
    'number.min': 'Moderate patients cannot be negative'
  }),

  convalescing_patients: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Convalescing patients must be a number',
    'number.integer': 'Convalescing patients must be an integer',
    'number.min': 'Convalescing patients cannot be negative'
  }),

  admitted_patients: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Admitted patients must be a number',
    'number.integer': 'Admitted patients must be an integer',
    'number.min': 'Admitted patients cannot be negative'
  }),

  discharged_patients: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Discharged patients must be a number',
    'number.integer': 'Discharged patients must be an integer',
    'number.min': 'Discharged patients cannot be negative'
  }),

  total_patients_calculated: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Total patients calculated must be a number',
    'number.integer': 'Total patients calculated must be an integer',
    'number.min': 'Total patients calculated cannot be negative'
  }),

  free_beds_calculated: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Free beds calculated must be a number',
    'number.integer': 'Free beds calculated must be an integer',
    'number.min': 'Free beds calculated cannot be negative'
  }),

  bed_occupancy_rate: Joi.number().min(0).max(999.99).optional().messages({
    'number.base': 'Bed occupancy rate must be a number',
    'number.min': 'Bed occupancy rate cannot be negative',
    'number.max': 'Bed occupancy rate cannot exceed 999.99',
  }),

  productivity_score: Joi.number().min(0).max(999.99).optional().messages({
    'number.base': 'Productivity score must be a number',
    'number.min': 'Productivity score cannot be negative',
    'number.max': 'Productivity score cannot exceed 999.99',
  }),

  created_by: Joi.number().integer().positive().optional().messages({
    'number.base': 'Created by must be a number',
    'number.integer': 'Created by must be an integer',
    'number.positive': 'Created by must be positive'
  }),

  updated_by: Joi.number().integer().positive().optional().messages({
    'number.base': 'Updated by must be a number',
    'number.integer': 'Updated by must be an integer',
    'number.positive': 'Updated by must be positive'
  })
});

export const getProductivityRecordsQuerySchema = Joi.object({
  department_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Department ID must be a number',
    'number.integer': 'Department ID must be an integer',
    'number.positive': 'Department ID must be positive'
  }),

  shift_date: Joi.date().optional().messages({
    'date.base': 'Shift date must be a valid date'
  }),

  shift_type_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Shift type ID must be a number',
    'number.integer': 'Shift type ID must be an integer',
    'number.positive': 'Shift type ID must be positive'
  }),

  date_from: Joi.date().optional().messages({
    'date.base': 'Date from must be a valid date'
  }),

  date_to: Joi.date().optional().messages({
    'date.base': 'Date to must be a valid date'
  }),

  page: Joi.number().integer().min(1).default(1).optional().messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1'
  }),

  limit: Joi.number().integer().min(1).max(100).default(20).optional().messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
  })
});

export const departmentStatsQuerySchema = Joi.object({
  date_from: Joi.date().optional().messages({
    'date.base': 'Date from must be a valid date'
  }),

  date_to: Joi.date().optional().messages({
    'date.base': 'Date to must be a valid date'
  }),

  shift_type_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Shift type ID must be a number',
    'number.integer': 'Shift type ID must be an integer',
    'number.positive': 'Shift type ID must be positive'
  })
});

// Health Region Dashboard validation schema
export const healthRegionDashboardSchema = Joi.object({
  fiscal_year: Joi.number().integer().min(2500).required().messages({
    'number.base': 'Fiscal year must be a number',
    'number.integer': 'Fiscal year must be an integer',
    'number.min': 'Fiscal year must be at least 2500',
    'any.required': 'Fiscal year is required'
  }),

  health_region_id: Joi.number().integer().min(1).optional().messages({
    'number.base': 'Health region ID must be a number',
    'number.integer': 'Health region ID must be an integer',
    'number.min': 'Health region ID must be between 1 and 13',
  }),

  start_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().messages({
    'string.pattern.base': 'Start date must be in YYYY-MM-DD format',
    'any.required': 'Start date is required'
  }),

  end_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().messages({
    'string.pattern.base': 'End date must be in YYYY-MM-DD format',
    'any.required': 'End date is required'
  })
});

// Province Dashboard validation schema
export const provinceDashboardSchema = Joi.object({
  province_code: Joi.string().length(2).required().messages({
    'string.base': 'Province code must be a string',
    'string.length': 'Province code must be exactly 2 characters',
    'any.required': 'Province code is required'
  }),

  fiscal_year: Joi.number().integer().min(2500).required().messages({
    'number.base': 'Fiscal year must be a number',
    'number.integer': 'Fiscal year must be an integer',
    'number.min': 'Fiscal year must be at least 2500',
    'any.required': 'Fiscal year is required'
  }),

  health_region_id: Joi.number().integer().min(1).max(13).optional().messages({
    'number.base': 'Health region ID must be a number',
    'number.integer': 'Health region ID must be an integer',
    'number.min': 'Health region ID must be between 1 and 13',
    'number.max': 'Health region ID must be between 1 and 13'
  }),

  start_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().messages({
    'string.pattern.base': 'Start date must be in YYYY-MM-DD format'
  }),

  end_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().messages({
    'string.pattern.base': 'End date must be in YYYY-MM-DD format'
  })
});

export const facilityDashboardByCategorySchema = Joi.object({
  facility_id: Joi.number().integer().required().messages({
    'any.required': 'Facility ID is required',
    'number.base': 'Facility ID must be a number'
  }),
  shift_date: Joi.date().iso().required().messages({
    'any.required': 'Shift date is required',
    'date.format': 'Shift date must be in YYYY-MM-DD format'
  }),
});