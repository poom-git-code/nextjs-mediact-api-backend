import Joi from "joi";

export const createNotificationSchema = Joi.object({
    title: Joi.string().max(255).required().messages({
        "string.base": "Title must be a string",
        "string.empty": "Title is required",
        "string.max": "Title must not exceed 255 characters",
        "any.required": "Title is required",
    }),

    content: Joi.string().required().messages({
        "string.base": "Content must be a string",
        "string.empty": "Content is required",
        "any.required": "Content is required",
    }),

    start_datetime: Joi.date().required().messages({
        "date.base": "Start datetime must be a valid date",
        "any.required": "Start datetime is required",
    }),

    end_datetime: Joi.date().required().greater(Joi.ref("start_datetime")).messages({
        "date.base": "End datetime must be a valid date",
        "date.greater": "End datetime must be after start datetime",
        "any.required": "End datetime is required",
    }),

    registration_limit: Joi.number().integer().min(0).allow(null).optional().messages({
        'number.base': 'Registration limit must be a number',
        'number.integer': 'Registration limit must be a whole number',
        'number.min': 'Registration limit cannot be negative',
    }),

    is_active: Joi.boolean().default(true).messages({
        "boolean.base": "is_active must be a boolean",
    }),

    selected_user_ids: Joi.array().items(Joi.number().integer().positive()).optional().messages({
        "array.base": "selected_user_ids must be an array",
        "number.base": "Each user ID must be a number",
        "number.integer": "Each user ID must be an integer",
        "number.positive": "Each user ID must be a positive number",
    }),
});
