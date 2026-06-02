import Joi from 'joi';

export const createPartnerReferenceFileSchema = Joi.object({
    partner_id: Joi.number().required().messages({
        'any.required': 'partner_id is required',
        'number.base': 'partner_id must be a number',
    }),
    file_name: Joi.string().max(50).required().messages({
        'any.required': 'file_name is required',
        'string.base': 'file_name must be a string',
        'string.max': 'file_name must not exceed 50 characters',
    }),
    file_url: Joi.string().uri().max(1024).required().messages({
        'any.required': 'file_url is required',
        'string.base': 'file_url must be a string',
        'string.uri': 'file_url must be a valid URL',
        'string.max': 'file_url must not exceed 1024 characters',
    }),
});

export const updatePartnerReferenceFileSchema = Joi.object({
    partner_id: Joi.number().optional().messages({
        'number.base': 'partner_id must be a number',
    }),
    file_name: Joi.string().max(50).optional().messages({
        'any.required': 'file_name is required',
        'string.base': 'file_name must be a string',
        'string.max': 'file_name must not exceed 50 characters',
    }),
    file_url: Joi.string().uri().max(1024).optional().messages({
        'string.base': 'file_url must be a string',
        'string.uri': 'file_url must be a valid URL',
        'string.max': 'file_url must not exceed 1024 characters',
    }),
    is_active: Joi.boolean().optional().messages({
        'boolean.base': 'is_active must be true or false',
    }),
});
