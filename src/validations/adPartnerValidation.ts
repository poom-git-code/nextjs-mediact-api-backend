import Joi from "joi";

// Validation for creating a new ad partner
export const createAdPartnerSchema = Joi.object({
    partner_type_id: Joi.number().integer().positive().required().messages({
        'number.base': 'Partner type ID must be a number.',
        'number.integer': 'Partner type ID must be an integer.',
        'number.postive': 'Partner type ID must be a positive number.',
        'any.required': 'Partner type ID is required.',
    }),

    status_id: Joi.number().integer().positive().required().messages({
        'number.base': 'status ID must be a number.',
        'number.integer': 'status ID must be an integer.',
        'number.postive': 'status ID must be a positive number.',
        'any.required': 'Status ID is required.',
    }),

    partner_name: Joi.string().max(50).required().messages({
        'string.base': 'Partner name must be a string.',
        'string.max': 'Partner name must not exceed 50 characters.',
        'any.required': 'Partner name is required.',
    }),

    contact_name: Joi.string().max(50).optional().allow(null, "").messages({
        'string.base': 'Contact name must be a string.',
        'string.max': 'Contact name must not exceed 50 characters.',
        'any.required': 'Contact name is required.',
    }),

    email: Joi.string().email().required().messages({
        'string.email': 'Email must be a valid email address.',
        'any.required': 'Email is required.',
    }),

    contact_email: Joi.string().email().optional().allow(null, "").messages({
        'string.email': 'Contact Email must be a valid email address.',
    }),

    country_code: Joi.string().max(10).required().messages({
        'string.base': 'Country code must be a string.',
        'string.max': 'Country code must not exceed 10 characters.',
        'any.required': 'Country code is required.',
    }),

    phone_number: Joi.string().max(20).required().messages({
        'string.base': 'Phone number must be a string.',
        'string.max': 'Phone number must not exceed 20 characters.',
        'any.required': 'Phone number is required.',
    }),

    contact_phone_number: Joi.string().max(20).optional().allow(null, "").messages({
        'string.base': 'Contact Phone number must be a string.',
        'string.max': 'Contact Phone number must not exceed 20 characters.',
    }),

    profile_picture: Joi.string().uri().optional().allow('', null).messages({
        'string.uri': 'Profile picture must be a valid URI',
    }),

    tax_id: Joi.string().max(50).optional().allow(null, "").messages({
        'string.base': 'Tax ID must be a string.',
        'string.max': 'Tax ID must not exceed 50 characters.',
    }),
})

// Validation for editing a ad partner
export const editAdPartnerSchema = Joi.object({
    partner_type_id: Joi.number().integer().positive().optional().allow(null).messages({
        'number.base': 'Partner type ID must be a number.',
        'number.integer': 'Partner type ID must be an integer.',
        'number.postive': 'Partner type ID must be a positive number.',
    }),

    status_id: Joi.number().integer().positive().optional().allow(null).messages({
        'number.base': 'status ID must be a number.',
        'number.integer': 'status ID must be an integer.',
        'number.postive': 'status ID must be a positive number.',
    }),

    partner_name: Joi.string().max(50).optional().messages({
        'string.base': 'Partner name must be a string.',
        'string.max': 'Partner name must not exceed 50 characters.',
        'any.required': 'Partner name is required.',
    }),

    contact_name: Joi.string().max(50).optional().allow(null, "").messages({
        'string.base': 'Contact name must be a string.',
        'string.max': 'Contact name must not exceed 50 characters.',
        'any.required': 'Contact name is required.',
    }),

    email: Joi.string().email().optional().allow(null).messages({
        'string.email': 'Email must be a valid email address.',
    }),

    contact_email: Joi.string().email().optional().allow(null, "").messages({
        'string.email': 'Contact Email must be a valid email address.',
    }),

    country_code: Joi.string().max(10).optional().allow(null).messages({
        'string.base': 'Country code must be a string.',
        'string.max': 'Country code must not exceed 10 characters.',
    }),

    phone_number: Joi.string().max(20).optional().allow(null).messages({
        'string.base': 'Phone number must be a string.',
        'string.max': 'Phone number must not exceed 20 characters.',
    }),

    contact_phone_number: Joi.string().max(20).optional().allow(null, "").messages({
        'string.base': 'Contact Phone number must be a string.',
        'string.max': 'Contact Phone number must not exceed 20 characters.',
    }),

    profile_picture: Joi.string().uri().optional().allow('', null).messages({
        'string.uri': 'Profile picture must be a valid URI',
    }),

    tax_id: Joi.string().max(50).optional().allow(null, "").messages({
        'string.base': 'Tax ID must be a string.',
        'string.max': 'Tax ID must not exceed 50 characters.',
    }),
})

