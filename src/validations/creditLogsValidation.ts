import Joi from 'joi';

export const createCreditLogSchema = Joi.object({
    credit_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Credit ID is required.',
        'number.base': 'Credit ID must be a number.',
        'number.integer': 'Credit ID must be an integer.',
        'number.positive': 'Credit ID must be positive.',
    }),

    reference_id: Joi.number().integer().positive().optional().allow(null),

    change: Joi.number().precision(4).min(0).optional().messages({
        'number.base': 'Used Budget must be a number.',
        'number.min': 'Used Budget must be at least 0.',
        'number.precision': 'Used Budget must have up to 4 decimal places.',
    }),

    type: Joi.string()
        .valid('click', 'impression', 'refund', 'topup')
        .required()
        .messages({
            'any.required': 'Type is required.',
            'any.only': 'Type must be one of: click, impression, refund, topup.',
        }),

    description: Joi.string().optional().messages({
        'any.required': 'Description is required.',
        'string.base': 'Description must be a string.',
    }),
});

// export const updateCreditLogSchema = Joi.object({
//     credit_id: Joi.number().integer().positive().optional(),
//     reference_id: Joi.number().integer().positive().optional().allow(null),
//     change: Joi.number().precision(2).optional(),
//     type: Joi.string()
//         .valid('click', 'impression', 'refund', 'topup')
//         .optional(),
//     description: Joi.string().optional(),
// });

export const emailReportSchema = Joi.object({
    to: Joi.string().email().required().messages({
        'string.email': 'Invalid email format',
        'any.required': 'Email is required'
    }),
    fileName: Joi.string().required().messages({
        'any.required': 'File name is required'
    }),
    pdfData: Joi.string().dataUri().required().messages({
        'string.dataUri': 'Invalid PDF data format',
        'any.required': 'PDF data is required'
    }),
    partnerName: Joi.string().required().messages({
        'any.required': 'Partner name is required'
    })
});
