import Joi from "joi";

export const createBoothEventListSchema = Joi.object({
  booth_event_id: Joi.number().required(),
  stamp_code: Joi.string().max(100).required(),
  booth_name: Joi.string().max(255).required(),
  is_active: Joi.boolean().default(true),
});

export const updateBoothEventListSchema = Joi.object({
  booth_event_id: Joi.number(),
  stamp_code: Joi.string().max(100),
  booth_name: Joi.string().max(255),
  is_active: Joi.boolean(),
}).min(1);
