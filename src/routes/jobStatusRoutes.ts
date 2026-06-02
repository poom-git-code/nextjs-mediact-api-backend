import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as JobStatusController from "../controllers/jobStatusController";

const router = new Router({ prefix: "/job-statuses" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.get("/", JobStatusController.getAllJobStatuses);
router.get("/:id", JobStatusController.getJobStatusById);
router.post("/", JobStatusController.createJobStatus);
router.put("/:id", JobStatusController.updateJobStatus);
router.delete("/:id", JobStatusController.deleteJobStatus);

export default router;