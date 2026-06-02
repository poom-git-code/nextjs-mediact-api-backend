import Joi from 'joi';

export const createAdsSchema = Joi.object({
    partner_id: Joi.number().integer().positive().required().messages({
        'number.base': 'Partner ID must be a number.',
        'number.integer': 'Partner ID must be an integer.',
        'number.positive': 'Partner ID must be a positive number.',
        'any.required': 'Partner ID is required.',
    }),

    ad_type_id: Joi.number().integer().positive().required().messages({
        'number.base': 'Ad type ID must be a number.',
        'number.integer': 'Ad type ID must be an integer.',
        'number.positive': 'Ad type ID must be a positive number.',
        'any.required': 'Ad type ID is required.',
    }),

    url: Joi.string().uri().optional().allow('', null).messages({
        'string.uri': 'URL must be a valid URI.',
    }),

    start_date: Joi.date().iso().optional().allow(null).messages({
        'date.base': 'Start date must be a valid date.',
        'date.format': 'Start date must be in ISO format (YYYY-MM-DD).',
    }),

    end_date: Joi.date().iso().optional().allow(null).messages({
        'date.base': 'End date must be a valid date.',
        'date.format': 'End date must be in ISO format (YYYY-MM-DD).',
    }),

    title: Joi.string().max(255).required().messages({
        'string.base': 'Title must be a string.',
        'string.max': 'Title must not exceed 255 characters.',
        'any.required': 'Title is required.',
    }),

    content: Joi.string().optional().allow('', null).messages({
        'string.base': 'Content must be a string.',
    }),

    // status: Joi.string().valid('active', 'paused', 'ended', 'inactive').required().default('active').messages({
    //     'string.base': 'Status must be a string.',
    //     'any.only': 'Status must be one of: active, paused, ended.',
    // }),

    budget: Joi.number().precision(4).min(0).optional().messages({
        'number.base': 'Budget must be a number.',
        'number.min': 'Budget must be at least 0.',
        'number.precision': 'Budget must have up to 4 decimal places.',
    }),

    used_budgets: Joi.number().precision(4).min(0).optional().messages({
        'number.base': 'Used Budget must be a number.',
        'number.min': 'Used Budget must be at least 0.',
        'number.precision': 'Used Budget must have up to 4 decimal places.',
    }),

    cost_per_click: Joi.number().precision(4).min(0).optional().messages({
        'number.base': 'Cost per click must be a number.',
        'number.min': 'Cost per click must be at least 0.',
        'number.precision': 'Cost per click must have up to 4 decimal places.',
    }),

    cost_per_impression: Joi.number().precision(4).min(0).optional().messages({
        'number.base': 'Cost per impression must be a number.',
        'number.min': 'Cost per impression must be at least 0.',
        'number.precision': 'Cost per impression must have up to 4 decimal places.',
    }),
});

export const editAdsSchema = Joi.object({
    partner_id: Joi.number().integer().positive().optional().messages({
        'number.base': 'Partner ID must be a number.',
        'number.integer': 'Partner ID must be an integer.',
        'number.positive': 'Partner ID must be a positive number.',
    }),

    ad_type_id: Joi.number().integer().positive().optional().messages({
        'number.base': 'Ad type ID must be a number.',
        'number.integer': 'Ad type ID must be an integer.',
        'number.positive': 'Ad type ID must be a positive number.',
    }),

    url: Joi.string().uri().optional().allow('', null).messages({
        'string.uri': 'URL must be a valid URI.',
    }),

    start_date: Joi.date().iso().optional().allow(null).messages({
        'date.base': 'Start date must be a valid date.',
        'date.format': 'Start date must be in ISO format (YYYY-MM-DD).',
    }),

    end_date: Joi.date().iso().optional().allow(null).messages({
        'date.base': 'End date must be a valid date.',
        'date.format': 'End date must be in ISO format (YYYY-MM-DD).',
    }),

    title: Joi.string().max(255).optional().messages({
        'string.base': 'Title must be a string.',
        'string.max': 'Title must not exceed 255 characters.',
    }),

    content: Joi.string().optional().allow('', null).messages({
        'string.base': 'Content must be a string.',
    }),

    status: Joi.string().valid('active', 'paused', 'ended', 'inactive').optional().default('active').messages({
        'string.base': 'Status must be a string.',
        'any.only': 'Status must be one of: active, paused, ended.',
    }),

    budget: Joi.number().precision(4).min(0).optional().messages({
        'number.base': 'Budget must be a number.',
        'number.min': 'Budget must be at least 0.',
        'number.precision': 'Budget must have up to 4 decimal places.',
    }),

    used_budgets: Joi.number().precision(4).min(0).optional().messages({
        'number.base': 'Used Budget must be a number.',
        'number.min': 'Used Budget must be at least 0.',
        'number.precision': 'Used Budget must have up to 4 decimal places.',
    }),

    cost_per_click: Joi.number().precision(4).min(0).optional().messages({
        'number.base': 'Cost per click must be a number.',
        'number.min': 'Cost per click must be at least 0.',
        'number.precision': 'Cost per click must have up to 4 decimal places.',
    }),

    cost_per_impression: Joi.number().precision(4).min(0).optional().messages({
        'number.base': 'Cost per impression must be a number.',
        'number.min': 'Cost per impression must be at least 0.',
        'number.precision': 'Cost per impression must have up to 4 decimal places.',
    }),
});