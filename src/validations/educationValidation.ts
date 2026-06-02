import Joi from 'joi';

export const educationSchema = Joi.object({
  user_id: Joi.number().integer().required(),
  degree_id: Joi.number().integer().required(),
  institution_id: Joi.number().integer().required(),
  field_of_study: Joi.string().max(255).allow(null, ''),
  graduation_year: Joi.number().integer().min(1900).max(new Date().getFullYear()).allow(null),
  document_url: Joi.string().uri().max(255).allow(null, ''),
  is_active: Joi.boolean().default(true),
  created_by: Joi.number().integer().allow(null),
  updated_by: Joi.number().integer().allow(null),
});