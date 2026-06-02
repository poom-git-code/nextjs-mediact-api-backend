import Joi from 'joi';

// Schema for creating an ad impression
export const createAdImpressionSchema = Joi.object({
    ad_id: Joi.number().integer().positive().optional().messages({
        'number.base': 'ad_id must be a number.',
        'number.integer': 'ad_id must be an integer.',
        'number.positive': 'ad_id must be a positive number.',
        'any.required': 'ad_id is required.',
    }),

    ad_media_id: Joi.number().integer().positive().required().messages({ 
        'number.base': 'ad_media_id must be a number.',
        'number.integer': 'ad_media_id must be an integer.',
        'number.positive': 'ad_media_id must be a positive number.',
    }),

    timestamp: Joi.date().optional().messages({
        'date.base': 'timestamp must be a valid date.',
    }),

    viewer_ip: Joi.string().ip({ version: ['ipv4', 'ipv6'], cidr: 'forbidden' }).optional().messages({
        'string.ip': 'viewer_ip must be a valid IP address.',
    }),

    viewer_user_id: Joi.number().integer().positive().optional().messages({
        'number.base': 'viewer_user_id must be a number.',
        'number.integer': 'viewer_user_id must be an integer.',
        'number.positive': 'viewer_user_id must be a positive number.',
    }),
});
