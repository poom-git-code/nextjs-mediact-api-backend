import Joi from 'joi';

export const createPartnerStatusSchema = Joi.object({
    name: Joi.string().max(50).required().messages({
        'any.required': 'Status name is required.',
        'string.base': 'Status name must be a string.',
        'string.max': 'Status name must not exceed 50 characters.',
    }),
    description: Joi.string().allow(null, '').messages({
        'string.base': 'Description must be a string.',
    }),
});

export const updatePartnerStatusSchema = Joi.object({
    name: Joi.string().max(50).optional().messages({
        'string.base': 'Status name must be a string.',
        'string.max': 'Status name must not exceed 50 characters.',
    }),
    description: Joi.string().allow(null, '').optional().messages({
        'string.base': 'Description must be a string.',
    }),
    is_active: Joi.boolean().optional().messages({
        'boolean.base': 'is_active must be true or false.',
    }),
});
