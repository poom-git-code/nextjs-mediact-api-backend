import Joi from 'joi';

export const createCreditApprovalLogSchema = Joi.object({
    credit_log_id: Joi.number().integer().positive().optional(),
    approver_id: Joi.number().integer().positive().required(),
    status: Joi.string().valid('approved', 'rejected').required(),
    remark: Joi.string().allow(null, '').optional(),
});