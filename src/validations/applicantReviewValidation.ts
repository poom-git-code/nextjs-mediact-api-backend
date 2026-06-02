import Joi from "joi";

/**
 * Schema สำหรับการสร้างรีวิวใหม่
 */
export const createApplicantReviewSchema = Joi.object({
    job_apply_id: Joi.number().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().max(2000).optional().allow(null, ""),
});


/**
 * Schema สำหรับการอัปเดตรีวิว
 */
export const updateApplicantReviewSchema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).optional(),
    comment: Joi.string().max(2000).optional().allow(null, ""),
})
    .or('rating', 'comment');