import Joi from "joi";

export const createApproverSchema = Joi.object({
    user_id: Joi.number().integer().positive().required(),
    username: Joi.string().max(50).optional(),
    email: Joi.string().email().optional().allow(null, ''),
    first_name: Joi.string().max(60).required(),
    last_name: Joi.string().max(60).required(),
    phone_number: Joi.string().max(20).optional().allow(null, ''),
});