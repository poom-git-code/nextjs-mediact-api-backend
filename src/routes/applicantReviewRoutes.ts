import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as ApplicantReviewController from "../controllers/applicantReviewController";

const router = new Router();

router.use(languageMiddleware);

// Default group
router.get("/applicant-reviews", ApplicantReviewController.getAllApplicantReviews);
router.get("/applicant-reviews/:id", ApplicantReviewController.getApplicantReviewById);
router.post("/applicant-reviews", ApplicantReviewController.createApplicantReview);
router.put("/applicant-reviews/:id", ApplicantReviewController.updateApplicantReview);
router.delete("/applicant-reviews/:id", ApplicantReviewController.deleteApplicantReview);

// Mobile group
router.get("/mobile/applicant-reviews", ApplicantReviewController.getAllApplicantReviews);
router.get("/mobile/applicant-reviews/:id", ApplicantReviewController.getApplicantReviewById);
router.post("/mobile/applicant-reviews", ApplicantReviewController.createApplicantReview);
router.put("/mobile/applicant-reviews/:id", ApplicantReviewController.updateApplicantReview);
router.delete("/mobile/applicant-reviews/:id", ApplicantReviewController.deleteApplicantReview);

// Partner group
router.get("/partner/applicant-reviews", ApplicantReviewController.getAllApplicantReviews);
router.get("/partner/applicant-reviews/:id", ApplicantReviewController.getApplicantReviewById);
router.post("/partner/applicant-reviews", ApplicantReviewController.createApplicantReview);
router.put("/partner/applicant-reviews/:id", ApplicantReviewController.updateApplicantReview);
router.delete("/partner/applicant-reviews/:id", ApplicantReviewController.deleteApplicantReview);

router.get(
    "/partner/applicant-reviews/user/:userId",
    ApplicantReviewController.getReviewsForApplicant
);

// Backoffice group
router.get("/backoffice/applicant-reviews", ApplicantReviewController.getAllApplicantReviews);
router.get("/backoffice/applicant-reviews/:id", ApplicantReviewController.getApplicantReviewById);
router.post("/backoffice/applicant-reviews", ApplicantReviewController.createApplicantReview);
router.put("/backoffice/applicant-reviews/:id", ApplicantReviewController.updateApplicantReview);
router.delete("/backoffice/applicant-reviews/:id", ApplicantReviewController.deleteApplicantReview);

export default router;