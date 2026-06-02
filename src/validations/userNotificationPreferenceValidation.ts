import Joi from "joi";

export const upsertPreferenceSchema = Joi.object({
    key: Joi.string().required().messages({
        'string.empty': '"key" is required',
        'any.required': '"key" is required',
    }),
    enabled: Joi.boolean().required().messages({
        'boolean.base': '"enabled" must be a boolean (true/false)',
        'any.required': '"enabled" is required',
    }),
});

export const createPreferenceSchema = Joi.object({
    user_id: Joi.number().integer().positive().required(),
    preference_key: Joi.string().required(),
    is_enabled: Joi.boolean().optional().default(true),
});

export const updatePreferenceSchema = Joi.object({
    is_enabled: Joi.boolean().required(),
});

export const updateByKeyTypeSchema = Joi.object({
    key_type_id: Joi.number().integer().positive().required().messages({
        'number.base': '"key_type_id" must be a number',
        'any.required': '"key_type_id" is required',
    }),
    enabled: Joi.boolean().required().messages({
        'boolean.base': '"enabled" must be a boolean (true/false)',
        'any.required': '"enabled" is required',
    }),
});