import Joi from "joi";

/**
 * Schema สำหรับ validate การเพิ่ม certification_id (จาก body)
 */
export const addDeptCertSchema = Joi.object({
  certification_id: Joi.number().integer().positive().required().messages({
    "number.base": "Certification ID must be a number.",
    "number.integer": "Certification ID must be an integer.",
    "number.positive": "Certification ID must be a positive number.",
    "any.required": "Certification ID is required.",
  }),
});
