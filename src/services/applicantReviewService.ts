import { sequelize } from "../config/database";
import { Op } from "sequelize";
import ApplicantReviewModel from "../models/ApplicantReviewModel";
import JobApplyModel from "../models/JobApplyModel";
import JobModel from "../models/JobsModel";
import UserModel from "../models/UserModel";
import * as NotificationsService from "../services/notificationsService";
import {
    getUserAttributes,
    decryptAndCleanUserData,
} from "../utils/encryptedFieldMapping";
import DepartmentModel from "../models/DepartmentModel";
import FacilityModel from "../models/FacilitiesModel";

/**
 * Interface สำหรับข้อมูลที่จะใช้สร้าง Review
 */
interface CreateReviewData {
    job_apply_id: number;
    rating: number;
    comment?: string | null;
}

interface PaginationOptions {
    page?: number;
    limit?: number;
}

/**
 * Create - สร้างรีวิวใหม่
 * @param data - ข้อมูลรีวิว (job_apply_id, rating, comment)
 * @param reviewerUserId - ID ของผู้ที่ทำการรีวิว
 */
export const createApplicantReview = async (
    data: CreateReviewData,
    reviewerUserId: number
) => {
    const { job_apply_id, rating, comment } = data;

    let createdReview: ApplicantReviewModel | null = null;
    let application: JobApplyModel | null = null;

    try {
        const review = await sequelize.transaction(async (t) => {
            // ค้นหา Application ที่เกี่ยวข้อง เพื่อดึงข้อมูล Job และ User (ผู้สมัคร)
            application = await JobApplyModel.findByPk(job_apply_id, {
                include: [
                    {
                        model: JobModel,
                        as: "job",
                        attributes: ["id", "job_title"],
                    },
                    {
                        model: UserModel,
                        as: "user",
                        attributes: ["id", "first_name", "last_name"],
                    },
                ],
                transaction: t,
            });

            if (!application) {
                throw new Error("Job application not found");
            }

            // ตรวจสอบว่าเคยมีรีวิวสำหรับ Application นี้แล้วหรือยัง
            const existingReview = await ApplicantReviewModel.findOne({
                where: { job_apply_id: job_apply_id },
                transaction: t,
            });

            if (existingReview) {
                throw new Error("A review for this application already exists.");
            }

            // สร้างรีวิว
            createdReview = await ApplicantReviewModel.create(
                {
                    job_apply_id: job_apply_id,
                    reviewer_id: reviewerUserId,
                    rating: rating,
                    comment: comment || null,
                },
                { transaction: t }
            );

            (createdReview as any).application = application;

            return createdReview;
        });

        const reviewApp = (review as any).application as JobApplyModel;

        // ตรวจสอบข้อมูลจาก review object ที่ได้กลับมา
        if (
            review &&
            reviewApp &&
            (reviewApp as any).user &&
            (reviewApp as any).job
        ) {
            const applicantUser = (reviewApp as any).user;
            const job = (reviewApp as any).job;

            // await NotificationsService.sendNotification({
            //     title: "คุณได้รับรีวิวการทำงาน",
            //     message: `คุณได้รับรีวิว ( ${rating} ดาว ) สำหรับงาน "${job.job_title || "N/A"
            //         }"`,
            //     target_channel: "user",
            //     target_value: applicantUser.id?.toString(),
            //     data: {
            //         reviewId: review.id,
            //         jobApplyId: reviewApp.id,
            //         topic: "Job Review",
            //     },
            // });
        }

        return review;
    } catch (error: any) {
        console.error("Error creating applicant review:", error);
        throw error;
    }
};

/**
 * Read - ดึงข้อมูลรีวิวตาม ID
 * @param id - ID ของรีวิว
 */
export const getApplicantReviewById = async (id: number) => {
    const review = await ApplicantReviewModel.findByPk(id, {
        include: [
            {
                model: UserModel,
                as: "reviewer",
                attributes: getUserAttributes(),
            },
            {
                model: JobApplyModel,
                as: "application",
                include: [
                    {
                        model: UserModel,
                        as: "user",
                        attributes: getUserAttributes(),
                    },
                    {
                        model: JobModel,
                        as: "job",
                        attributes: ["id", "job_title", "work_date"],
                    },
                ],
            },
        ],
    });

    if (!review) {
        throw new Error("Applicant review not found");
    }

    // Decrypt ข้อมูล user ตามตัวอย่าง
    const reviewData = review.toJSON();

    if (review.reviewer) {
        reviewData.reviewer = review.reviewer.toPipedaCompliantJSON();
    }
    if (review.application?.user) {
        reviewData.application.user = review.application.user.toPipedaCompliantJSON();
    }

    return reviewData;
};

/**
 * Read - ดึงข้อมูลรีวิวทั้งหมด
 * @param options - ตัวเลือกการกรอง เช่น { where: { job_apply_id: ... } }
 */
export const getAllApplicantReviews = async (options: any = {}) => {
    const reviews = await ApplicantReviewModel.findAll({
        ...options,
        order: [["created_at", "DESC"]],
        include: [
            {
                model: UserModel,
                as: "reviewer",
                attributes: getUserAttributes(),
            },
            {
                model: JobApplyModel,
                as: "application",
                include: [
                    {
                        model: UserModel,
                        as: "user",
                        attributes: getUserAttributes(),
                    },
                    {
                        model: JobModel,
                        as: "job",
                        attributes: ["id", "job_title"],
                    },
                ],
            },
        ],
    });

    // Decrypt ข้อมูล user ทั้งหมด
    const processedReviews = reviews.map((review: any) => {
        const reviewData = review.toJSON();
        if (reviewData.reviewer) {
            reviewData.reviewer = review.reviewer.toPipedaCompliantJSON();
        }
        if (review.application?.user) {
            reviewData.application.user = review.application.user.toPipedaCompliantJSON();
        }
        return reviewData;
    });

    return processedReviews;
};

/**
 * Update - อัปเดตข้อมูลรีวิว (เฉพาะ rating และ comment)
 * @param id - ID ของรีวิว
 * @param updates - ข้อมูลที่ต้องการอัปเดต (rating, comment)
 * @param reviewerUserId - ID ของผู้ที่อัปเดต
 */
export const updateApplicantReview = async (
    id: number,
    updates: { rating?: number; comment?: string | null },
    reviewerUserId: number
) => {
    const review = await ApplicantReviewModel.findByPk(id, {
        include: [
            {
                model: JobApplyModel,
                as: "application",
                include: [
                    { model: JobModel, as: "job" },
                    { model: UserModel, as: "user" },
                ],
            },
        ],
    });

    if (!review) {
        throw new Error("Applicant review not found");
    }

    // จำกัดข้อมูลอัปเดตเฉพาะ rating และ comment
    const allowedUpdates = {
        rating: updates.rating !== undefined ? updates.rating : review.rating,
        comment: updates.comment !== undefined ? updates.comment : review.comment,
    };

    const updatedReview = await review.update(allowedUpdates);

    // ส่ง Notification ไปยังผู้สมัคร
    const app = (updatedReview as any).application;
    const user = (app as any).user;
    const job = (app as any).job;

    if (app && user && job) {
        // await NotificationsService.sendNotification({
        //     title: "รีวิวของคุณถูกแก้ไข",
        //     message: `รีวิวสำหรับการทำงานในตำแหน่ง "${job.job_title}" ถูกอัปเดต`,
        //     target_channel: "user",
        //     target_value: user.id?.toString(),
        //     data: { reviewId: updatedReview.id, jobApplyId: app.id },
        // });
    }

    return updatedReview;
};

/**
 * Delete (Soft) - ปิดการใช้งานรีวิว
 * @param id - ID ของรีวิว
 */
export const deleteApplicantReview = async (id: number) => {
    const review = await ApplicantReviewModel.findByPk(id);

    if (!review) {
        throw new Error("Applicant review not found or is already inactive.");
    }

    const jobApplyId = review.job_apply_id;

    await review.update({ is_active: false });

    // แจ้งเตือนผู้สมัครว่ารีวิวถูกปิดการใช้งาน
    const application = await JobApplyModel.findByPk(jobApplyId, {
        include: [{ model: UserModel, as: "user", attributes: ["id"] }],
    });

    if (application && (application as any).user) {
        // await NotificationsService.sendNotification({
        //     title: "รีวิวถูกปิดใช้งาน",
        //     message: `รีวิวสำหรับการสมัครงาน (ID: ${jobApplyId}) ถูกปิดใช้งาน`,
        //     target_channel: "user",
        //     target_value: (application as any).user.id.toString(),
        //     data: { jobApplyId: jobApplyId },
        // });
    }

    return { message: "Review deactivated successfully." };
};

/**
 * Read - ดึงรีวิวทั้งหมดสำหรับ User (ผู้สมัคร) คนเดียว
 * @param applicantUserId - ID ของ User ที่เป็นผู้สมัคร
 */
export const getReviewsByApplicantId = async (
    applicantUserId: number,
    options: PaginationOptions = {}
) => {
    const limit = options.limit || 25;
    const page = options.page || 1;
    const offset = (page - 1) * limit;

    const { count, rows: reviews } = await ApplicantReviewModel.findAndCountAll({
        include: [
            {
                model: JobApplyModel,
                as: "application",
                where: { user_id: applicantUserId },
                attributes: ["id", "user_id"],
                include: [
                    {
                        model: JobModel,
                        as: "job",
                        attributes: ["id", "job_title"],
                        include: [
                            {
                                model: DepartmentModel,
                                as: "department",
                                attributes: ["id", "name"],
                                include: [
                                    {
                                        model: FacilityModel,
                                        as: "facility",
                                        attributes: ["id", "name"]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                model: UserModel,
                as: "reviewer",
                attributes: ["id", "first_name", "last_name"]
            },
        ],
        order: [["created_at", "DESC"]],
        limit: limit,
        offset: offset,
        distinct: true,
    });

    const ratingResult = await ApplicantReviewModel.findOne({
        attributes: [[sequelize.fn("AVG", sequelize.col("rating")), "averageRating"]],
        include: [{ model: JobApplyModel, as: "application", where: { user_id: applicantUserId }, attributes: [] }],
        raw: true,
    });

    const averageRating = (ratingResult as any)?.averageRating
        ? parseFloat((ratingResult as any).averageRating)
        : 0;
    const totalRating = parseFloat(averageRating.toFixed(1));

    const processedReviews = reviews.map((review: any) => {
        const json = review.toJSON();

        const application = json.application;
        const job = application?.job;
        const department = job?.department;
        const facility = department?.facility;

        let reviewerDisplayName = "System";
        if (facility && facility.name) {
            reviewerDisplayName = facility.name;
        } else if (json.reviewer) {
            reviewerDisplayName = `${json.reviewer.first_name} ${json.reviewer.last_name}`;
        }

        return {
            id: json.id,
            job_apply_id: json.job_apply_id,
            rating: json.rating,
            comment: json.comment,
            created_at: json.created_at,
            is_active: json.is_active,

            job_title: job?.job_title || "Unknown Job",
            department_name: department?.name || "",

            reviewer_name: reviewerDisplayName, // ชื่อโรงพยาบาล
            facility_id: facility?.id || null,  // ID โรงพยาบาล
        };
    });

    const totalPages = Math.ceil(count / limit);

    return {
        reviews: processedReviews,
        totalRating: totalRating,
        pagination: {
            totalItems: count,
            totalPages: totalPages,
            currentPage: page,
            pageSize: limit,
        },
    };
};