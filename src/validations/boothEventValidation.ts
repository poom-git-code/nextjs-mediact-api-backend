import Joi from "joi";

export const createBoothEventSchema = Joi.object({
  name: Joi.string().max(255).required(),
  type: Joi.string().valid("online", "onsite").default("onsite").required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  total_stamps_required: Joi.number().integer().min(1).default(5).required(),
  is_active: Joi.boolean().default(true),
});

export const updateBoothEventSchema = Joi.object({
  name: Joi.string().max(255),
  type: Joi.string().valid("online", "onsite"),
  start_date: Joi.date(),
  end_date: Joi.date(),
  total_stamps_required: Joi.number().integer().min(1),
  is_active: Joi.boolean(),
}).min(1);
