import Joi from 'joi';

export const createCreditRequestSchema = Joi.object({
    credit_id: Joi.number().integer().positive().required(),
    amount: Joi.number().positive().precision(4).required(),
    request_type: Joi.string().valid('topup', 'adjustment').required(),
    status: Joi.string().valid('pending', 'approved', 'rejected').required(),
    requested_by: Joi.number().integer().positive().optional(),
    approved_by: Joi.number().integer().positive().optional().allow(null),
    remark: Joi.string().allow(null, '').optional(),
});