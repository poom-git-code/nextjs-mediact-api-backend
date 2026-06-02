import Joi from "joi";

export const createLeaveTypeSchema = Joi.object({
  name: Joi.string().max(255).required(),
  description: Joi.string().optional().allow(null, ""),
  is_active: Joi.boolean().optional(),
  created_by: Joi.number().optional().allow(null),
  updated_by: Joi.number().optional().allow(null),
});

export const updateLeaveTypeSchema = createLeaveTypeSchema.fork(
  ["name"],
  (schema) => schema.optional()
);