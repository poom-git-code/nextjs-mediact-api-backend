import Joi from "joi";

export const createJobApplySchema = Joi.object({
  job_id: Joi.number().required(),
  user_id: Joi.number().required(),
  status_id: Joi.number().required(),
  apply_date: Joi.date().optional(),
  remark: Joi.string().max(255).optional().allow(null, ""),
  approve_user_id: Joi.number().optional().allow(null),
  approve_date: Joi.date().optional().allow(null),
  created_by: Joi.number().optional().allow(null),
  updated_by: Joi.number().optional().allow(null),
});

export const updateJobApplySchema = createJobApplySchema.fork(
  ["job_id", "user_id", "status_id"],
  (schema) => schema.optional()
);