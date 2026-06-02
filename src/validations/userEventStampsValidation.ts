import Joi from "joi";

export const createUserEventStampSchema = Joi.object({
  booth_event_id: Joi.number().required(),
  user_id: Joi.number().required(),
  stamp_code: Joi.string().max(100).required(),
  scanned_at: Joi.date().required(),
});

export const redeemStampSchema = Joi.object({
  booth_event_id: Joi.number().required(),
  user_id: Joi.number().required(),
});
