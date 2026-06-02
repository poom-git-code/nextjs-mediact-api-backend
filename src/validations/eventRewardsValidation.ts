import Joi from "joi";

export const createRewardSchema = Joi.object({
  booth_event_id: Joi.number().required(),
  // user_id: Joi.number().required(),
});
