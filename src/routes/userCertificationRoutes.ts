import Router from "koa-router";
import { languageMiddleware } from "../middleware/languageMiddleware";
import * as UserCertificationController from "../controllers/userCertificationController";

const router = new Router({ prefix: "/user-certifications" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.get("/mobile", UserCertificationController.getUserCertificationsByToken);

router.get("/", UserCertificationController.getAllUserCertifications);
// router.get("/user", UserCertificationController.getUserCertificationsByUserId);
router.get(
  "/user/:id",
  UserCertificationController.getUserCertificationsByUserId
);
router.get("/:id", UserCertificationController.getUserCertificationById);

router.post("/", UserCertificationController.createUserCertification);
router.put("/:id", UserCertificationController.updateUserCertification);
router.delete("/:id", UserCertificationController.deleteUserCertification);

export default router;
