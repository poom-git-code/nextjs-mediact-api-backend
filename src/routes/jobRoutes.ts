import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as JobController from "../controllers/jobController";

// const router = new Router({ prefix: "/partner/jobs" });

const router = new Router();

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// All
router.get("/jobs", JobController.getAllJobs);
router.get("/jobs/facility/:facilityId", JobController.getAllJobsByFacility);
router.get("/jobs/facility", JobController.getJobsByUserFacility);
router.get("/jobs/:id", JobController.getJobByIdBackoffice);
router.post("/jobs", JobController.createJob);
router.put("/jobs/:id", JobController.updateJob);
router.delete("/jobs/:id", JobController.deleteJob);

// Mobile routes
router.get("/mobile/jobs", JobController.getAvailableAndAppliedJobsByPublishGroup);
router.get("/mobile/jobs/facility/:facilityId", JobController.getAllJobsByFacility);
router.get("/mobile/jobs/facility", JobController.getJobsByUserFacility);
router.get("/mobile/jobs/:id", JobController.getJobById);
router.post("/mobile/jobs", JobController.createJob);
router.put("/mobile/jobs/:id", JobController.updateJob);
router.delete("/mobile/jobs/:id", JobController.deleteJob);

// Partner routes
router.get("/partner/jobs", JobController.getAllJobs);
// router.get("/partner/jobs/facility/:facilityId", JobController.getAllJobsByFacility);
router.get("/partner/jobs/facility", JobController.getJobsByUserFacility);
router.get("/partner/jobs/:id", JobController.getJobByIdBackoffice);
router.post("/partner/jobs", JobController.createJob);
router.put("/partner/jobs/:id", JobController.updateJob);
router.delete("/partner/jobs/:id", JobController.deleteJob);

// Backoffice routes
router.get("/backoffice/jobs", JobController.getAllJobs);
router.get("/backoffice/jobs/facility/:facilityId", JobController.getAllJobsByFacility);
router.get("/backoffice/jobs/facility", JobController.getJobsByUserFacility);
router.get("/backoffice/jobs/:id", JobController.getJobByIdBackoffice);
router.post("/backoffice/jobs", JobController.createJob);
router.put("/backoffice/jobs/:id", JobController.updateJob);
router.delete("/backoffice/jobs/:id", JobController.deleteJob);

router.post('/partner/jobs/:id/broadcast', JobController.broadcastJob);
router.put('/partner/jobs/:id/update-and-broadcast', JobController.updateAndBroadcast);

router.get(
    "/partner/jobs/count/by-department",
    JobController.getPendingApplicantsByDepartment
);

export default router;