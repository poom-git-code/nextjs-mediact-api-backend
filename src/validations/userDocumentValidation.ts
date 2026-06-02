import Joi from "joi";

// Create UserDocument validation schema
export const createUserDocumentSchema = Joi.object({
  user_id: Joi.number().integer().positive().optional().messages({
    "number.base": "User ID must be a number",
    "number.integer": "User ID must be an integer",
    "number.positive": "User ID must be positive",
  }),
  document_type_id: Joi.number().integer().positive().required().messages({
    "number.base": "Document Type ID must be a number",
    "number.integer": "Document Type ID must be an integer",
    "number.positive": "Document Type ID must be positive",
    "any.required": "Document Type ID is required",
  }),
  document_sub_type_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      "number.base": "Document Sub Type ID must be a number",
      "number.integer": "Document Sub Type ID must be an integer",
      "number.positive": "Document Sub Type ID must be positive",
    }),
  file_url: Joi.string().uri().max(1024).required().messages({
    "string.base": "File URL must be a string",
    "string.uri": "File URL must be a valid URI",
    "string.max": "File URL must not exceed 1024 characters",
    "any.required": "File URL is required",
  }),
  document_number: Joi.string().max(100).optional().allow(null, "").messages({
    "string.base": "Document number must be a string",
    "string.max": "Document number must not exceed 100 characters",
  }),
  issue_date: Joi.date().optional().allow(null).messages({
    "date.base": "Issue date must be a valid date",
  }),
  expiry_date: Joi.date().optional().allow(null).messages({
    "date.base": "Expiry date must be a valid date",
  }),
  status: Joi.string()
    .valid("PENDING", "APPROVED", "REJECTED")
    .optional()
    .default("PENDING")
    .messages({
      "string.base": "Status must be a string",
      "any.only": "Status must be one of: PENDING, APPROVED, REJECTED",
    }),
  rejection_reason: Joi.string().optional().allow(null, "").messages({
    "string.base": "Rejection reason must be a string",
  }),
});

// Update UserDocument validation schema
export const updateUserDocumentSchema = Joi.object({
  user_id: Joi.number().integer().positive().optional().messages({
    "number.base": "User ID must be a number",
    "number.integer": "User ID must be an integer",
    "number.positive": "User ID must be positive",
  }),
  document_type_id: Joi.number().integer().positive().optional().messages({
    "number.base": "Document Type ID must be a number",
    "number.integer": "Document Type ID must be an integer",
    "number.positive": "Document Type ID must be positive",
  }),
  document_sub_type_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      "number.base": "Document Sub Type ID must be a number",
      "number.integer": "Document Sub Type ID must be an integer",
      "number.positive": "Document Sub Type ID must be positive",
    }),
  file_url: Joi.string().uri().max(1024).optional().messages({
    "string.base": "File URL must be a string",
    "string.uri": "File URL must be a valid URI",
    "string.max": "File URL must not exceed 1024 characters",
  }),
  document_number: Joi.string().max(100).optional().allow(null, "").messages({
    "string.base": "Document number must be a string",
    "string.max": "Document number must not exceed 100 characters",
  }),
  issue_date: Joi.date().optional().allow(null).messages({
    "date.base": "Issue date must be a valid date",
  }),
  expiry_date: Joi.date().optional().allow(null).messages({
    "date.base": "Expiry date must be a valid date",
  }),
  status: Joi.string()
    .valid("PENDING", "APPROVED", "REJECTED")
    .optional()
    .messages({
      "string.base": "Status must be a string",
      "any.only": "Status must be one of: PENDING, APPROVED, REJECTED",
    }),
  rejection_reason: Joi.string().optional().allow(null, "").messages({
    "string.base": "Rejection reason must be a string",
  }),
  verified_at: Joi.date().optional().allow(null).messages({
    "date.base": "Verified at must be a valid date",
  }),
});

// Get UserDocuments query validation
export const getUserDocumentsQuerySchema = Joi.object({
  searchQuery: Joi.string().optional().allow("").messages({
    "string.base": "Search query must be a string",
  }),
  facilityId: Joi.number().integer().positive().optional().allow("").messages({
    "number.base": "Facility ID must be a number",
  }),
  departmentId: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow("")
    .messages({
      "number.base": "Department ID must be a number",
    }),
  startDate: Joi.date().optional().allow("").messages({
    "date.base": "Start date must be a valid date",
  }),
  endDate: Joi.date().optional().allow("").messages({
    "date.base": "End date must be a valid date",
  }),

  user_id: Joi.number().integer().positive().optional().messages({
    "number.base": "User ID must be a number",
    "number.integer": "User ID must be an integer",
    "number.positive": "User ID must be positive",
  }),
  document_type_id: Joi.number().integer().positive().optional().messages({
    "number.base": "Document Type ID must be a number",
  }),
  document_sub_type_id: Joi.number().integer().positive().optional().messages({
    "number.base": "Document Sub Type ID must be a number",
  }),
  status: Joi.string()
    .valid("PENDING", "APPROVED", "REJECTED")
    .optional()
    .messages({
      "string.base": "Status must be a string",
      "any.only": "Status must be one of: PENDING, APPROVED, REJECTED",
    }),
  page: Joi.number().integer().positive().optional().default(1).messages({
    "number.base": "Page must be a number",
  }),

  limit: Joi.number()
    .integer()
    .min(-1)
    .max(1000)
    .optional()
    .default(20)
    .messages({
      "number.base": "Limit must be a number",
      "number.integer": "Limit must be an integer",
      "number.min": "Limit must be -1 or positive",
      "number.max": "Limit must not exceed 1000",
    }),
});
