import Joi from "joi";

export const createUserGroupTagSchema = Joi.object({
  name: Joi.string().min(1).max(255).required().messages({
    "string.empty": "ชื่อกลุ่มผู้ใช้งานไม่สามารถเป็นค่าว่างได้",
    "string.min": "ชื่อกลุ่มผู้ใช้งานต้องมีความยาวอย่างน้อย 1 ตัวอักษร",
    "string.max": "ชื่อกลุ่มผู้ใช้งานต้องมีความยาวไม่เกิน 255 ตัวอักษร",
    "any.required": "กรุณาระบุชื่อกลุ่มผู้ใช้งาน",
  }),
  description: Joi.string().allow(null, "").optional().messages({
    "string.base": "คำอธิบายต้องเป็นข้อความ",
  }),
  department_id: Joi.number().integer().positive().required().messages({
    "number.base": "รหัสแผนกต้องเป็นตัวเลข",
    "number.integer": "รหัสแผนกต้องเป็นจำนวนเต็ม",
    "number.positive": "รหัสแผนกต้องเป็นจำนวนเต็มบวก",
    "any.required": "กรุณาระบุรหัสแผนก",
  }),
  role_id: Joi.number().integer().positive().required().messages({
    "number.base": "รหัสตำแหน่งต้องเป็นตัวเลข",
    "number.integer": "รหัสตำแหน่งต้องเป็นจำนวนเต็ม",
    "number.positive": "รหัสตำแหน่งต้องเป็นจำนวนเต็มบวก",
    "any.required": "กรุณาระบุรหัสตำแหน่ง",
  }),
  color_code: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).allow(null, "").optional().messages({
    "string.pattern.base": "รหัสสีต้องอยู่ในรูปแบบ #RRGGBB เช่น #FF5733",
  }),
  seq: Joi.number().integer().min(0).allow(null).optional().messages({
    "number.base": "หมายเลขลำดับต้องเป็นตัวเลข",
    "number.integer": "หมายเลขลำดับต้องเป็นจำนวนเต็ม",
    "number.min": "หมายเลขลำดับต้องเป็นจำนวนเต็มที่ไม่ติดลบ",
  }),
  is_active: Joi.boolean().optional().messages({
    "boolean.base": "สถานะการใช้งานต้องเป็น true หรือ false",
  }),
});

export const updateUserGroupTagSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional().messages({
    "string.empty": "ชื่อกลุ่มผู้ใช้งานไม่สามารถเป็นค่าว่างได้",
    "string.min": "ชื่อกลุ่มผู้ใช้งานต้องมีความยาวอย่างน้อย 1 ตัวอักษร",
    "string.max": "ชื่อกลุ่มผู้ใช้งานต้องมีความยาวไม่เกิน 255 ตัวอักษร",
  }),
  description: Joi.string().allow(null, "").optional().messages({
    "string.base": "คำอธิบายต้องเป็นข้อความ",
  }),
  department_id: Joi.number().integer().positive().optional().messages({
    "number.base": "รหัสแผนกต้องเป็นตัวเลข",
    "number.integer": "รหัสแผนกต้องเป็นจำนวนเต็ม",
    "number.positive": "รหัสแผนกต้องเป็นจำนวนเต็มบวก",
  }),
  role_id: Joi.number().integer().positive().allow(null).optional().messages({
    "number.base": "รหัสตำแหน่งต้องเป็นตัวเลข",
    "number.integer": "รหัสตำแหน่งต้องเป็นจำนวนเต็ม",
    "number.positive": "รหัสตำแหน่งต้องเป็นจำนวนเต็มบวก",
  }),
  color_code: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).allow(null, "").optional().messages({
    "string.pattern.base": "รหัสสีต้องอยู่ในรูปแบบ #RRGGBB เช่น #FF5733",
  }),
  seq: Joi.number().integer().min(0).allow(null).optional().messages({
    "number.base": "หมายเลขลำดับต้องเป็นตัวเลข",
    "number.integer": "หมายเลขลำดับต้องเป็นจำนวนเต็ม",
    "number.min": "หมายเลขลำดับต้องเป็นจำนวนเต็มที่ไม่ติดลบ",
  }),
  is_active: Joi.boolean().optional().messages({
    "boolean.base": "สถานะการใช้งานต้องเป็น true หรือ false",
  }),
});

export const addUserToGroupTagSchema = Joi.object({
  user_id: Joi.number().integer().positive().required().messages({
    "number.base": "รหัสผู้ใช้งานต้องเป็นตัวเลข",
    "number.integer": "รหัสผู้ใช้งานต้องเป็นจำนวนเต็ม",
    "number.positive": "รหัสผู้ใช้งานต้องเป็นจำนวนเต็มบวก",
    "any.required": "กรุณาระบุรหัสผู้ใช้งาน",
  }),
});

export const addUserToMultipleGroupTagsSchema = Joi.object({
  group_tag_ids: Joi.array().items(
    Joi.number().integer().positive()
  ).min(1).required().messages({
    "array.base": "group_tag_ids ต้องเป็น array",
    "array.min": "ต้องระบุ group tag อย่างน้อย 1 อัน",
    "any.required": "กรุณาระบุ group_tag_ids"
  }),
});

export const getUserGroupTagsByRoleSchema = Joi.object({
  role_id: Joi.number().integer().positive().required().messages({
    "number.base": "รหัสตำแหน่งต้องเป็นตัวเลข",
    "number.integer": "รหัสตำแหน่งต้องเป็นจำนวนเต็ม",
    "number.positive": "รหัสตำแหน่งต้องเป็นจำนวนเต็มบวก",
    "any.required": "กรุณาระบุรหัสตำแหน่ง",
  }),
  department_id: Joi.number().integer().positive().optional().messages({
    "number.base": "รหัสแผนกต้องเป็นตัวเลข",
    "number.integer": "รหัสแผนกต้องเป็นจำนวนเต็ม",
    "number.positive": "รหัสแผนกต้องเป็นจำนวนเต็มบวก",
  }),
});

export const getUserGroupTagsByDepartmentAndRoleSchema = Joi.object({
  department_id: Joi.number().integer().positive().required().messages({
    "number.base": "รหัสแผนกต้องเป็นตัวเลข",
    "number.integer": "รหัสแผนกต้องเป็นจำนวนเต็ม",
    "number.positive": "รหัสแผนกต้องเป็นจำนวนเต็มบวก",
    "any.required": "กรุณาระบุรหัสแผนก",
  }),
  role_id: Joi.number().integer().positive().optional().messages({
    "number.base": "รหัสตำแหน่งต้องเป็นตัวเลข",
    "number.integer": "รหัสตำแหน่งต้องเป็นจำนวนเต็ม",
    "number.positive": "รหัสตำแหน่งต้องเป็นจำนวนเต็มบวก",
  }),
});
