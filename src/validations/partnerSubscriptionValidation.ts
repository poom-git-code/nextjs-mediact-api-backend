import Joi from "joi";

// Validation schema for facility ID parameter
export const facilityIdParamSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        'number.base': 'Facility ID must be a number.',
        'number.integer': 'Facility ID must be an integer.',
        'number.positive': 'Facility ID must be a positive number.',
        'any.required': 'Facility ID is required.',
    }),
});

// Validation schema for feature parameter
export const featureParamSchema = Joi.object({
    feature: Joi.string().valid('full_schedule', 'mediact_match').required().messages({
        'string.base': 'Feature must be a string.',
        'any.only': 'Feature must be either "full_schedule" or "mediact_match".',
        'any.required': 'Feature parameter is required.',
    }),
});

// Combined validation for facility ID and feature parameters
export const facilityFeatureParamsSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        'number.base': 'Facility ID must be a number.',
        'number.integer': 'Facility ID must be an integer.',
        'number.positive': 'Facility ID must be a positive number.',
        'any.required': 'Facility ID is required.',
    }),
    feature: Joi.string().valid('full_schedule', 'mediact_match').required().messages({
        'string.base': 'Feature must be a string.',
        'any.only': 'Feature must be either "full_schedule" or "mediact_match".',
        'any.required': 'Feature parameter is required.',
    }),
});