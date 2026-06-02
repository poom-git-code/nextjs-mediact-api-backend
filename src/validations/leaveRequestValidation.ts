import Joi from "joi";

export const createLeaveRequestSchema = Joi.object({
  leave_type_id: Joi.number().required(),
  shift_list: Joi.string().max(255).optional().allow(null),
  month: Joi.number().min(1).max(12).required(),
  year: Joi.number().required(),
  schedule_master_id: Joi.number().optional().allow(null),
  leave_date: Joi.date().required(),
  start_time: Joi.string().required(),
  end_time: Joi.string().required(),
  reason: Joi.string().optional().allow(null, ''),
  status: Joi.string().max(255).required(),
  approve_user_id: Joi.number().optional().allow(null),
  approve_date: Joi.date().optional().allow(null),
  remark: Joi.string().max(255).optional().allow(null, ''),
  created_by: Joi.number().optional().allow(null),
  updated_by: Joi.number().optional().allow(null),
});

export const updateLeaveRequestSchema = createLeaveRequestSchema.fork(
  [
    "leave_type_id",
    "shift_list",
    "month",
    "year",
    "schedule_master_id",
    "leave_date",
    "start_time",
    "end_time",
    "reason",
    "status",
    "approve_user_id",
    "remark",
  ],
  (schema) => schema.optional()
);
