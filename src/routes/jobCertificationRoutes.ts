import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as JobCertificationController from "../controllers/jobCertificationController";

const router = new Router({ prefix: "/job-certifications" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.get("/", JobCertificationController.getAllJobCertifications);
router.get("/:id", JobCertificationController.getJobCertificationById);
router.post("/", JobCertificationController.createJobCertification);
router.put("/:id", JobCertificationController.updateJobCertification);
router.delete("/:id", JobCertificationController.deleteJobCertification);

export default router;