import Joi from "joi";

export const createJobStatusSchema = Joi.object({
  name: Joi.string().max(50).required(),
  description: Joi.string().max(255).optional().allow(null, ""),
  is_active: Joi.boolean().optional(),
  created_by: Joi.number().optional().allow(null),
  updated_by: Joi.number().optional().allow(null),
});

export const updateJobStatusSchema = createJobStatusSchema.fork(
  ["name"],
  (schema) => schema.optional()
);