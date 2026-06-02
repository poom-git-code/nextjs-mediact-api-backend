import Joi from "joi";

export const createDayOffSchema = Joi.object({
  request_user_id: Joi.number().required(),
  assign_user_id: Joi.number().required(),
  day_off_date: Joi.date().required(),
  month: Joi.number().min(1).max(12).required(),
  year: Joi.number().required(),
  schedule_master_id: Joi.number().required(),
  status: Joi.string().max(255).required(),
  reason: Joi.string().optional().allow(null, ''),
  approve_user_id: Joi.number().required(),
  approve_date: Joi.date().optional().allow(null),
  remark: Joi.string().max(255).required(),
  created_by: Joi.number().optional().allow(null),
  updated_by: Joi.number().optional().allow(null),
});

export const updateDayOffSchema = createDayOffSchema.fork(
  [
    "request_user_id",
    "assign_user_id",
    "day_off_date",
    "month",
    "year",
    "schedule_master_id",
    "status",
    "reason",
    "approve_user_id",
    "remark",
  ],
  (schema) => schema.optional()
);