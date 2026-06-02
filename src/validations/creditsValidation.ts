import Joi from 'joi';

export const createCreditSchema = Joi.object({
  user_id: Joi.number().integer().positive().required().messages({
    'any.required': 'Partner ID is required.',
    'number.base': 'Partner ID must be a number.',
    'number.integer': 'Partner ID must be an integer.',
    'number.positive': 'Partner ID must be a positive number.',
  }),

  total_credits: Joi.number().precision(4).min(0).optional().messages({
        'number.base': 'Used Budget must be a number.',
        'number.min': 'Used Budget must be at least 0.',
        'number.precision': 'Used Budget must have up to 4 decimal places.',
  }),

  created_by: Joi.number().integer().positive().allow(null).optional().messages({
    'number.base': 'Created by must be a number.',
    'number.integer': 'Created by must be an integer.',
    'number.positive': 'Created by must be a positive number.',
  }),
});

// export const deductCreditSchema = Joi.object({
//   user_id: Joi.number().integer().positive().required().messages({
//     'any.required': 'Partner ID is required.',
//     'number.base': 'Partner ID must be a number.',
//     'number.integer': 'Partner ID must be an integer.',
//     'number.positive': 'Partner ID must be a positive number.',
//   }),

//   credits_to_deduct: Joi.number().integer().min(1).required().messages({
//     'any.required': 'Credits to deduct are required.',
//     'number.base': 'Credits to deduct must be a number.',
//     'number.integer': 'Credits to deduct must be an integer.',
//     'number.min': 'Credits to deduct must be at least 1.',
//   }),

//   updated_by: Joi.number().integer().positive().allow(null).optional().messages({
//     'number.base': 'Updated by must be a number.',
//     'number.integer': 'Updated by must be an integer.',
//     'number.positive': 'Updated by must be a positive number.',
//   }),
// });

export const checkRemainingCreditsSchema = Joi.object({
  user_id: Joi.number().integer().positive().required().messages({
    'any.required': 'Partner ID is required.',
    'number.base': 'Partner ID must be a number.',
    'number.integer': 'Partner ID must be an integer.',
    'number.positive': 'Partner ID must be a positive number.',
  }),
});


