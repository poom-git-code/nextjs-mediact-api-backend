import Joi from "joi";

export const createJobCertificationSchema = Joi.object({
  job_id: Joi.number().required(),
  certification_id: Joi.number().required(),
  created_by: Joi.number().optional().allow(null),
  updated_by: Joi.number().optional().allow(null),
});

export const updateJobCertificationSchema = createJobCertificationSchema.fork(
  ["job_id", "certification_id"],
  (schema) => schema.optional()
);