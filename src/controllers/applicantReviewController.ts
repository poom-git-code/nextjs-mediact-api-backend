import { Context } from "koa";
import * as ApplicantReviewService from "../services/applicantReviewService";
import {
    createApplicantReviewSchema,
    updateApplicantReviewSchema,
} from "../validations/applicantReviewValidation";

/**
 * Create - สร้างรีวิวใหม่
 */
export const createApplicantReview = async (ctx: Context) => {
    const reviewerUserId = ctx.state?.user?.id;
    if (!reviewerUserId) {
        ctx.status = 401;
        ctx.body = { error: "Unauthorized: User ID not found" };
        return;
    }

    const { error, value } = createApplicantReviewSchema.validate(
        ctx.request.body
    );
    if (error) {
        ctx.status = 400;
        ctx.body = { error: error.details[0].message };
        return;
    }

    try {
        const review = await ApplicantReviewService.createApplicantReview(
            value,
            reviewerUserId
        );
        ctx.status = 201;
        ctx.body = { message: "Review created successfully", review };
    } catch (err: any) {
        ctx.status = 400;
        ctx.body = { error: err.message || "Unknown error" };
    }
};

/**
 * Read - ดึงข้อมูลรีวิวตาม ID
 */
export const getApplicantReviewById = async (ctx: Context) => {
    const { id } = ctx.params;
    const reviewId = parseInt(id, 10);

    if (isNaN(reviewId)) {
        ctx.status = 400;
        ctx.body = { error: "Invalid review ID format. Must be a number." };
        return;
    }

    try {
        const review = await ApplicantReviewService.getApplicantReviewById(
            reviewId
        );
        ctx.body = { review };
    } catch (err: any) {
        ctx.status = 404;
        ctx.body = { error: err.message || "Unknown error" };
    }
};

/**
 * Read - ดึงข้อมูลรีวิวทั้งหมด
 */
export const getAllApplicantReviews = async (ctx: Context) => {
    try {
        const reviews = await ApplicantReviewService.getAllApplicantReviews();
        ctx.body = { reviews };
    } catch (err: any) {
        ctx.status = 500;
        ctx.body = { error: err.message || "Unknown error" };
    }
};

/**
 * Update - อัปเดตรีวิว (Rating/Comment)
 */
export const updateApplicantReview = async (ctx: Context) => {
    const { id } = ctx.params;
    const updateId = parseInt(id, 10);

    if (isNaN(updateId)) {
        ctx.status = 400;
        ctx.body = { error: "Invalid update ID format. Must be a number." };
        return;
    }

    const reviewerUserId = ctx.state?.user?.id;
    if (!reviewerUserId) {
        ctx.status = 401;
        ctx.body = { error: "Unauthorized: User ID not found" };
        return;
    }

    const { error, value } = updateApplicantReviewSchema.validate(
        ctx.request.body
    );
    if (error) {
        ctx.status = 400;
        ctx.body = { error: error.details[0].message };
        return;
    }

    try {
        const review = await ApplicantReviewService.updateApplicantReview(
            updateId,
            value,
            reviewerUserId
        );
        ctx.body = { message: "Review updated successfully", review };
    } catch (err: any) {
        ctx.status = 404;
        ctx.body = { error: err.message || "Unknown error" };
    }
};

/**
 * Delete (Soft) - ปิดการใช้งานรีวิว
 */
export const deleteApplicantReview = async (ctx: Context) => {
    const { id } = ctx.params;
    const deleteId = parseInt(id, 10);

    if (isNaN(deleteId)) {
        ctx.status = 400;
        ctx.body = { error: "Invalid delete ID format. Must be a number." };
        return;
    }

    try {
        await ApplicantReviewService.deleteApplicantReview(deleteId);
        ctx.body = { message: "Review deactivated successfully." };
    } catch (err: any) {
        ctx.status = 404;
        ctx.body = { error: err.message || "Unknown error" };
    }
};

/**
 * 6. Read - ดึงรีวิวทั้งหมดสำหรับ User (ผู้สมัคร)
 */
export const getReviewsForApplicant = async (ctx: Context) => {
    const { userId } = ctx.params; // ID ของผู้สมัคร (Applicant)
    const applicantId = parseInt(userId, 10);

    if (isNaN(applicantId)) {
        ctx.status = 400;
        ctx.body = { error: "Invalid applicant ID format. Must be a number." };
        return;
    }

    const { page, limit } = ctx.query;

    const pageNum = page ? parseInt(page as string, 10) : 1;
    const limitNum = limit ? parseInt(limit as string, 10) : 25;

    if (isNaN(pageNum) || pageNum < 1) {
        ctx.status = 400;
        ctx.body = { error: "Invalid 'page' parameter. Must be a positive number." };
        return;
    }
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        ctx.status = 400;
        ctx.body = { error: "Invalid 'limit' parameter. Must be between 1 and 100." };
        return;
    }

    const options = {
        page: pageNum,
        limit: limitNum,
    };

    try {
        const data = await ApplicantReviewService.getReviewsByApplicantId(
            applicantId,
            options
        );
        ctx.body = data;
    } catch (err: any) {
        ctx.status = 404;
        ctx.body = { error: err.message || "Unknown error" };
    }
};