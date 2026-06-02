import Joi from "joi";

// Validation for query parameters when getting health regions
export const healthRegionQuerySchema = Joi.object({
  include_provinces: Joi.string().valid('true', 'false').optional().messages({
    "any.only": "include_provinces must be 'true' or 'false'.",
  }),
  page: Joi.string().pattern(/^\d+$/).optional().messages({
    "string.pattern.base": "Page must be a valid number.",
  }),
  limit: Joi.string().pattern(/^\d+$/).optional().messages({
    "string.pattern.base": "Limit must be a valid number.",
  }),
});

// Validation for creating health region
export const createHealthRegionSchema = Joi.object({
  region_code: Joi.string().length(2).required().messages({
    "string.base": "Region code must be a string.",
    "string.length": "Region code must be exactly 2 characters.",
    "any.required": "Region code is required.",
  }),
  region_name_th: Joi.string().max(100).required().messages({
    "string.base": "Thai region name must be a string.",
    "string.max": "Thai region name must not exceed 100 characters.",
    "any.required": "Thai region name is required.",
  }),
  region_name_en: Joi.string().max(100).required().messages({
    "string.base": "English region name must be a string.",
    "string.max": "English region name must not exceed 100 characters.",
    "any.required": "English region name is required.",
  }),
});

// Validation for updating health region
export const updateHealthRegionSchema = Joi.object({
  region_code: Joi.string().length(2).optional().messages({
    "string.base": "Region code must be a string.",
    "string.length": "Region code must be exactly 2 characters.",
  }),
  region_name_th: Joi.string().max(100).optional().messages({
    "string.base": "Thai region name must be a string.",
    "string.max": "Thai region name must not exceed 100 characters.",
  }),
  region_name_en: Joi.string().max(100).optional().messages({
    "string.base": "English region name must be a string.",
    "string.max": "English region name must not exceed 100 characters.",
  }),
});

// Validation functions
export const validateHealthRegionQuery = (data: any) => {
  return healthRegionQuerySchema.validate(data, { abortEarly: false });
};

export const validateHealthRegionCreate = (data: any) => {
  return createHealthRegionSchema.validate(data, { abortEarly: false });
};

export const validateHealthRegionUpdate = (data: any) => {
  return updateHealthRegionSchema.validate(data, { abortEarly: false });
};
