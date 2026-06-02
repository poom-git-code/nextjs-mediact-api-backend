import Joi from 'joi';

export const createAdTargetSchema = Joi.object({
    ad_id: Joi.number().integer().positive().required().messages({
        'number.base': 'Ad ID must be a number.',
        'number.integer': 'Ad ID must be an integer.',
        'number.positive': 'Ad ID must be a positive number.',
        'any.required': 'Ad ID is required.',
    }),

    target_type: Joi.string().max(50).optional().messages({
        'string.base': 'Target type must be a string.',
        'string.max': 'Target type must not exceed 50 characters.',
        'any.required': 'Target type is required.',
    }),

    target_value: Joi.string().max(255).optional().messages({
        'string.base': 'Target value must be a string.',
        'string.max': 'Target value must not exceed 255 characters.',
        'any.required': 'Target value is required.',
    }),
});

export const updateAdTargetSchema = Joi.object({
    ad_id: Joi.number().integer().positive().optional().messages({
        'number.base': 'Ad ID must be a number.',
        'number.integer': 'Ad ID must be an integer.',
        'number.positive': 'Ad ID must be a positive number.',
        'any.required': 'Ad ID is required.',
    }),

    target_type: Joi.string().max(50).optional().messages({
        'string.base': 'Target type must be a string.',
        'string.max': 'Target type must not exceed 50 characters.',
    }),

    target_value: Joi.string().max(255).optional().messages({
        'string.base': 'Target value must be a string.',
        'string.max': 'Target value must not exceed 255 characters.',
    }),

    is_active: Joi.boolean().optional().messages({
        'boolean.base': 'is_active must be true or false',
    }),
});
