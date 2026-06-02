import Joi from "joi";

// Schema ย่อยสำหรับ 1 วัน (เลือกได้หลายกะ)
const dailyRequestItem = Joi.object({
  request_date: Joi.date().required(),
  shift_type_ids: Joi.array().items(Joi.number().integer()).min(1).required(), // รับเป็น Array ของ Shift ID เช่น [1, 2]
  reason: Joi.string().optional().allow(null, ""), // เหตุผลเฉพาะวัน (ถ้ามี)
});

export const createRequestShiftSchema = Joi.object({
  request_user_id: Joi.number().integer().required(),
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().required(),

  // รับเป็น Array ของวันที่เลือก
  items: Joi.array().items(dailyRequestItem).min(1).required(),

  // Global reason (ถ้ามี ใช้ร่วมกันทุกรายการ)
  reason: Joi.string().optional().allow(null, ""),
  created_by: Joi.number().integer().optional().allow(null),
});

export const updateRequestShiftSchema = Joi.object({
  request_date: Joi.date().optional(),
  shift_type_id: Joi.number().integer().optional(),
  status: Joi.string().max(50).optional(),
  reason: Joi.string().allow(null, "").optional(),
  approve_user_id: Joi.number().integer().optional().allow(null),
  approve_date: Joi.date().optional().allow(null),
  remark: Joi.string().max(255).optional().allow(null, ""),
  updated_by: Joi.number().integer().optional().allow(null),
});
