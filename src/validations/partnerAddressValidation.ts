import Joi from 'joi';

export const createPartnerAddressSchema = Joi.object({
    partner_id: Joi.number().integer().required(),
    address_type_id: Joi.number().integer().required(),
    address: Joi.string().max(255).required(),

    country_code: Joi.string().max(50).allow(null, ''),
    province_code: Joi.number().integer().allow(null),
    district_code: Joi.number().integer().allow(null),
    subdistrict_code: Joi.number().integer().allow(null),

    province_name_th: Joi.string().max(50).allow(null, ''),
    province_name_en: Joi.string().max(100).allow(null, ''),
    district_name_th: Joi.string().max(50).allow(null, ''),
    district_name_en: Joi.string().max(100).allow(null, ''),
    subdistrict_name_th: Joi.string().max(50).allow(null, ''),
    subdistrict_name_en: Joi.string().max(100).allow(null, ''),

    postal_code: Joi.string().length(5).required(),
    country_name_th: Joi.string().max(50).allow(null, ''),
    country_name_en: Joi.string().max(100).allow(null, ''),

    is_active: Joi.boolean().optional(),
});

export const updatePartnerAddressSchema = Joi.object({
    partner_id: Joi.number().integer().optional(),
    address_type_id: Joi.number().integer().optional(),
    address: Joi.string().max(255).optional(),

    country_code: Joi.string().max(50).allow(null, ''),
    province_code: Joi.number().integer().allow(null),
    district_code: Joi.number().integer().allow(null),
    subdistrict_code: Joi.number().integer().allow(null),

    province_name_th: Joi.string().max(50).allow(null, ''),
    province_name_en: Joi.string().max(100).allow(null, ''),
    district_name_th: Joi.string().max(50).allow(null, ''),
    district_name_en: Joi.string().max(100).allow(null, ''),
    subdistrict_name_th: Joi.string().max(50).allow(null, ''),
    subdistrict_name_en: Joi.string().max(100).allow(null, ''),

    postal_code: Joi.string().length(5).optional(),
    country_name_th: Joi.string().max(50).allow(null, ''),
    country_name_en: Joi.string().max(100).allow(null, ''),

    is_active: Joi.boolean().optional(),
});
