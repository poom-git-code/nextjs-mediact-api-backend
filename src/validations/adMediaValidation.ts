import Joi from 'joi';

// Schema สำหรับการเพิ่ม media
export const createAdMediaSchema = Joi.object({
    ad_id: Joi.number().integer().required(),
    media_name: Joi.string().max(50).optional(),
    media_url: Joi.string().uri().max(500).optional(),
    media_type: Joi.string().valid('image', 'video', 'audio').optional(),
    media_size: Joi.number().integer().optional(),
    thumbnail_url: Joi.string().uri().max(500).optional(),
});

// Schema สำหรับการอัปเดต media
export const updateAdMediaSchema = Joi.object({
    media_name: Joi.string().max(50).optional(),
    media_url: Joi.string().uri().max(500).optional(),
    media_type: Joi.string().valid('image', 'video', 'audio').optional(),
    media_size: Joi.number().integer().optional(),
    thumbnail_url: Joi.string().uri().max(500).optional(),
    is_active: Joi.boolean().optional().messages({
        'boolean.base': 'is_active must be true or false',
    }),
});
