import Joi from "joi";

export const createUserExperienceSchema = Joi.object({
  user_id: Joi.number().integer().positive().optional(),
  occupation_name: Joi.string().max(255).optional(),
  experience_years: Joi.number().integer().min(0).max(50).optional().default(0),
  experience_months: Joi.number()
    .integer()
    .min(0)
    .max(11)
    .optional()
    .default(0),
  occupation_place: Joi.string().max(255).required(),
  category_master_id: Joi.number().integer().positive().optional(),
  sub_category_master_id: Joi.number().integer().positive().optional(),
});

export const updateUserExperienceSchema = Joi.object({
  occupation_name: Joi.string().max(255).optional(),
  experience_years: Joi.number().integer().min(0).max(50).optional(),
  experience_months: Joi.number().integer().min(0).max(11).optional(),
  occupation_place: Joi.string().max(255).optional(),
  category_master_id: Joi.number().integer().positive().optional(),
  sub_category_master_id: Joi.number().integer().positive().optional(),
});

export const getUserExperiencesSchema = Joi.object({
  user_id: Joi.number().integer().positive().optional(),
});
