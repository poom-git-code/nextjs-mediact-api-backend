import Joi from 'joi';

// Validation for creating a facility
export const createFacilitySchema = Joi.object({
  name: Joi.string().trim().min(3).max(255).required().messages({
    'string.min': 'Name must be at least 3 characters.',
    'string.max': 'Name must not exceed 255 characters.',
    'any.required': 'Name is required.',
  }),

  abbreviation: Joi.string().trim().max(50).pattern(/^[A-Z0-9]*$/).required().messages({
    'string.pattern.base': 'Abbreviation must contain only uppercase letters and numbers.',
    'string.max': 'Abbreviation must not exceed 50 characters.',
    'any.required': 'Abbreviation is required.',
  }),

  type_id: Joi.number().integer().positive().required().messages({
    'any.required': 'Type ID is required.',
  }),

  latitude: Joi.number().precision(6).min(-90).max(90).required().messages({
    'number.min': 'Latitude must be between -90 and 90.',
    'number.max': 'Latitude must be between -90 and 90.',
    'any.required': 'Latitude is required.',
  }),

  longitude: Joi.number().precision(6).min(-180).max(180).required().messages({
    'number.min': 'Longitude must be between -180 and 180.',
    'number.max': 'Longitude must be between -180 and 180.',
    'any.required': 'Longitude is required.',
  }),

  address: Joi.string().trim().min(3).max(255).required().messages({
    'string.min': 'Address must be at least 3 characters.',
    'string.max': 'Address must not exceed 255 characters.',
    'any.required': 'Address is required.',
  }),

  country_code: Joi.string().max(50).required(),
  country_name_th: Joi.string().max(50).required(),
  country_name_en: Joi.string().max(100).required(),

  province_code: Joi.number().integer().positive().required().messages({
    'any.required': 'Province code is required.',
  }),
  province_name_th: Joi.string().max(50).required(),
  province_name_en: Joi.string().max(100).required(),

  district_code: Joi.number().integer().positive().required().messages({
    'any.required': 'District code is required.',
  }),
  district_name_th: Joi.string().max(50).required(),
  district_name_en: Joi.string().max(100).required(),

  subdistrict_code: Joi.number().integer().positive().required().messages({
    'any.required': 'Subdistrict code is required.',
  }),
  subdistrict_name_th: Joi.string().max(50).required(),
  subdistrict_name_en: Joi.string().max(100).required(),

  postal_code: Joi.string().trim().pattern(/^[0-9]{5}$/).required().messages({
    'string.pattern.base': 'Postal code must be 5 digits.',
    'any.required': 'Postal code is required.',
  }),

  full_schedule: Joi.boolean().allow(null).optional().messages({
    'boolean.base': 'full_schedule must be a boolean value.',
  }),

  mediact_match: Joi.boolean().allow(null).optional().messages({
    'boolean.base': 'mediact_match must be a boolean value.',
  }),

  is_active: Joi.boolean().required().messages({
    'any.required': 'Status is required.',
  }),
});

// Validation for updating a facility
export const updateFacilitySchema = Joi.object({
  name: Joi.string().trim().min(3).max(255).required().messages({
    'string.min': 'Name must be at least 3 characters.',
    'string.max': 'Name must not exceed 255 characters.',
    'any.required': 'Name is required.',
  }),

  abbreviation: Joi.string().trim().max(50).pattern(/^[A-Z0-9]*$/).required().messages({
    'string.pattern.base': 'Abbreviation must contain only uppercase letters and numbers.',
    'string.max': 'Abbreviation must not exceed 50 characters.',
    'any.required': 'Abbreviation is required.',
  }),

  type_id: Joi.number().integer().positive().required().messages({
    'any.required': 'Type ID is required.',
  }),

  latitude: Joi.number().precision(6).min(-90).max(90).required().messages({
    'number.min': 'Latitude must be between -90 and 90.',
    'number.max': 'Latitude must be between -90 and 90.',
    'any.required': 'Latitude is required.',
  }),

  longitude: Joi.number().precision(6).min(-180).max(180).required().messages({
    'number.min': 'Longitude must be between -180 and 180.',
    'number.max': 'Longitude must be between -180 and 180.',
    'any.required': 'Longitude is required.',
  }),

  address: Joi.string().trim().min(3).max(255).required().messages({
    'string.min': 'Address must be at least 3 characters.',
    'string.max': 'Address must not exceed 255 characters.',
    'any.required': 'Address is required.',
  }),

  country_code: Joi.string().max(50).required(),
  country_name_th: Joi.string().max(50).required(),
  country_name_en: Joi.string().max(100).required(),

  province_code: Joi.number().integer().positive().required().messages({
    'any.required': 'Province code is required.',
  }),
  province_name_th: Joi.string().max(50).required(),
  province_name_en: Joi.string().max(100).required(),

  district_code: Joi.number().integer().positive().required().messages({
    'any.required': 'District code is required.',
  }),
  district_name_th: Joi.string().max(50).required(),
  district_name_en: Joi.string().max(100).required(),

  subdistrict_code: Joi.number().integer().positive().required().messages({
    'any.required': 'Subdistrict code is required.',
  }),
  subdistrict_name_th: Joi.string().max(50).required(),
  subdistrict_name_en: Joi.string().max(100).required(),

  postal_code: Joi.string().trim().pattern(/^[0-9]{5}$/).required().messages({
    'string.pattern.base': 'Postal code must be 5 digits.',
    'any.required': 'Postal code is required.',
  }),

  full_schedule: Joi.boolean().allow(null).optional().messages({
    'boolean.base': 'full_schedule must be a boolean value.',
  }),

  mediact_match: Joi.boolean().allow(null).optional().messages({
    'boolean.base': 'mediact_match must be a boolean value.',
  }),

  is_active: Joi.boolean().required().messages({
    'any.required': 'Status is required.',
  }),
});