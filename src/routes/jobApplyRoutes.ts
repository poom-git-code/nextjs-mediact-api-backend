import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as JobApplyController from "../controllers/jobApplyController";

const router = new Router();

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// Default group
router.get("/job-applies", JobApplyController.getAllJobApplies);
router.get("/job-applies/:id", JobApplyController.getJobApplyById);
router.post("/job-applies", JobApplyController.createJobApply);
router.put("/job-applies/:id", JobApplyController.updateJobApply);
router.delete("/job-applies/:id", JobApplyController.deleteJobApply);
router.patch("/job-applies/:id/approve", JobApplyController.approveJobApply);
router.patch("/job-applies/:id/reject", JobApplyController.rejectJobApply);

// Mobile group
router.get("/mobile/job-applies", JobApplyController.getAllJobApplies);
router.get("/mobile/job-applies/:id", JobApplyController.getJobApplyById);
router.post("/mobile/job-applies", JobApplyController.createJobApply);
router.put("/mobile/job-applies/:id", JobApplyController.updateJobApply);
router.delete("/mobile/job-applies/:id", JobApplyController.deleteJobApply);
router.patch("/mobile/job-applies/:id/approve", JobApplyController.approveJobApply);
router.patch("/mobile/job-applies/:id/reject", JobApplyController.rejectJobApply);

// Partner group
router.get("/partner/job-applies", JobApplyController.getAllJobApplies);
router.get("/partner/job-applies/:id", JobApplyController.getJobApplyById);
router.post("/partner/job-applies", JobApplyController.createJobApply);
router.put("/partner/job-applies/:id", JobApplyController.updateJobApply);
router.delete("/partner/job-applies/:id", JobApplyController.deleteJobApply);
router.patch("/partner/job-applies/:id/approve", JobApplyController.approveJobApply);
router.patch("/partner/job-applies/:id/reject", JobApplyController.rejectJobApply);

// Backoffice group
router.get("/backoffice/job-applies", JobApplyController.getAllJobApplies);
router.get("/backoffice/job-applies/:id", JobApplyController.getJobApplyById);
router.post("/backoffice/job-applies", JobApplyController.createJobApply);
router.put("/backoffice/job-applies/:id", JobApplyController.updateJobApply);
router.delete("/backoffice/job-applies/:id", JobApplyController.deleteJobApply);
router.patch("/backoffice/job-applies/:id/approve", JobApplyController.approveJobApply);
router.patch("/backoffice/job-applies/:id/reject", JobApplyController.rejectJobApply);

export default router;