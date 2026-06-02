import Joi from "joi";

// Validation สำหรับสร้างคำขอยกเวร
export const createGiveShiftRequestSchema = Joi.object({
  shift_id: Joi.number().integer().positive().required().messages({
    "any.required": "Shift ID is required",
    "number.base": "Shift ID must be a number",
  }),
  target_user_id: Joi.number().integer().positive().required().messages({
    "any.required": "Target User ID is required",
  }),
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().required(),
  schedule_master_id: Joi.number().integer().required(),

  remark: Joi.string().max(255).optional().allow("", null),
});

// Validation สำหรับแก้ไขคำขอ (Update)
export const updateGiveShiftRequestSchema = createGiveShiftRequestSchema.fork(
  ["shift_id", "target_user_id", "month", "year", "schedule_master_id"],
  (schema) => schema.optional()
);

// Validation สำหรับ Action (Approve/Reject)
// รองรับทั้ง remark และ comment
export const actionGiveShiftRequestSchema = Joi.object({
  remark: Joi.string().max(255).optional().allow("", null),
  comment: Joi.string().max(255).optional().allow("", null),
});
