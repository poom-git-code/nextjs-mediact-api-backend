import Joi from 'joi';

export const getProductivityLogsQuerySchema = Joi.object({
  record_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Record ID must be a number',
    'number.integer': 'Record ID must be an integer',
    'number.positive': 'Record ID must be positive'
  }),
  
  action_type: Joi.string().valid('CREATE', 'UPDATE', 'DELETE').optional().messages({
    'string.base': 'Action type must be a string',
    'any.only': 'Action type must be one of CREATE, UPDATE, DELETE'
  }),
  
  action_by: Joi.number().integer().positive().optional().messages({
    'number.base': 'Action by must be a number',
    'number.integer': 'Action by must be an integer',
    'number.positive': 'Action by must be positive'
  }),
  
  date_from: Joi.date().optional().messages({
    'date.base': 'Date from must be a valid date'
  }),
  
  date_to: Joi.date().optional().messages({
    'date.base': 'Date to must be a valid date'
  }),
  
  page: Joi.number().integer().min(1).default(1).optional().messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1'
  }),
  
  limit: Joi.number().integer().min(1).max(100).default(20).optional().messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
  })
});
