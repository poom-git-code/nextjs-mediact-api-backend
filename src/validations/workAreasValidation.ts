import Joi from "joi";

export const createWorkAreaSchema = Joi.object({
  province_code: Joi.number().integer().positive().required(),
  // district can be CSV string "23,26,58" or an array of numbers
  district: Joi.alternatives()
    .try(Joi.string().pattern(/^\d+(,\d+)*$/), Joi.array().items(Joi.number().integer().positive()))
    .required()
    .messages({ "any.required": "district is required (csv or array)" }),
  job_type_id: Joi.alternatives()
    .try(Joi.string().pattern(/^\d+(,\d+)*$/), Joi.array().items(Joi.number().integer().positive()))
    .optional()
    .messages({ "any.required": "job_type_id is required (csv or array)" }),
  facility_type_id: Joi.alternatives()
    .try(Joi.string().pattern(/^\d+(,\d+)*$/), Joi.array().items(Joi.number().integer().positive()))
    .optional()
    .allow(null),
});

export const updateWorkAreaSchema = Joi.object({
  province_code: Joi.number().integer().positive().optional(),
  district: Joi.alternatives().try(Joi.string().pattern(/^\d+(,\d+)*$/), Joi.array().items(Joi.number().integer().positive())).optional(),
  job_type_id: Joi.alternatives().try(Joi.string().pattern(/^\d+(,\d+)*$/), Joi.array().items(Joi.number().integer().positive())).optional(),
  facility_type_id: Joi.alternatives().try(Joi.string().pattern(/^\d+(,\d+)*$/), Joi.array().items(Joi.number().integer().positive())).optional(),
});

export default {
  createWorkAreaSchema,
  updateWorkAreaSchema,
};
