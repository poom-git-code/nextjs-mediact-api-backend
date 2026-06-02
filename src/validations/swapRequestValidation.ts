import Joi from "joi";

export const createSwapRequestSchema = Joi.object({
  // user_id: Joi.number().required(),
  shift_id: Joi.number().required(),
  target_user_id: Joi.number().required(),
  swap_shift_id: Joi.number().required(),
  month: Joi.number().min(1).max(12).required(),
  year: Joi.number().required(),
  schedule_master_id: Joi.number().required(),
  target_approve_status: Joi.string()
    .valid("PENDING", "APPROVED", "DECLINED")
    .default("PENDING"),
  status: Joi.string().max(255).required(),
  approve_user_id: Joi.number().allow(null),
  approve_date: Joi.date().optional().allow(null),
  remark: Joi.string().max(255).required(),
  created_by: Joi.number().optional().allow(null),
  updated_by: Joi.number().optional().allow(null),
  description: Joi.string().max(255).optional(),
});

export const updateSwapRequestSchema = createSwapRequestSchema.fork(
  [
    // "user_id",
    "shift_id",
    "month",
    "year",
    "schedule_master_id",
    "status",
    "approve_user_id",
    "remark",
  ],
  (schema) => schema.optional()
);
