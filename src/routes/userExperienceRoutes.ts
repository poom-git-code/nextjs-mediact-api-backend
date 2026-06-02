import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as UserExperienceController from "../controllers/userExperienceController";
import { authenticate } from "../middlewares/auth.middleware";

const router = new Router({ prefix: "/user-experiences" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// Apply authentication middleware to all routes
router.use(authenticate);

// Routes
router.post("/", UserExperienceController.createUserExperience);
router.get("/", UserExperienceController.getUserExperiences);
router.get("/all", UserExperienceController.getAllUserExperiences);

router.get(
    "/applicant/:userId",
    UserExperienceController.getApplicantExperiencesController
);

router.get("/:id", UserExperienceController.getUserExperienceById);
router.put("/:id", UserExperienceController.updateUserExperience);
router.delete("/:id", UserExperienceController.deleteUserExperience);

export default router;
