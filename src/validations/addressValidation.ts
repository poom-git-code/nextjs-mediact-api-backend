import Joi from "joi";

const codeField = Joi.alternatives().try(Joi.number().integer(), Joi.string().pattern(/^\d+$/));

// Adjust the fields below to match your Sequelize 'addresses' table columns
export const createAddressSchema = Joi.object({
  id: Joi.number().integer().optional(),
  reference_id: Joi.number().integer().required(),
  address_line1: Joi.string().max(255).required(),
  address_line2: Joi.string().allow('').max(255).optional(),
  address_type: codeField.required(),
  country: Joi.string().max(100).required(),
  country_code : Joi.string().max(10).required(),
  province: Joi.string().max(255).required(),
  province_code: codeField.required(),
  district: Joi.string().max(100).required(),
  district_code: codeField.required(),
  sub_district: Joi.string().max(100).required(),
  subdistrict_code: codeField.required(),
  postal_code: Joi.string().max(5).required(),
});

export const updateAddressSchema = Joi.object({
  id: Joi.number().integer().optional(),
  address_line1: Joi.string().max(255).required(),
  address_line2: Joi.string().allow('').max(255).optional(),
  address_type: codeField.required(),
  country: Joi.string().max(100).required(),
  province: Joi.string().max(255).required(),
  province_code: codeField.required(),
  district: Joi.string().max(100).required(),
  district_code: codeField.required(),
  sub_district: Joi.string().max(100).required(),
  subdistrict_code: codeField.required(),
  postal_code: Joi.string().max(5).required(),
}).min(1);