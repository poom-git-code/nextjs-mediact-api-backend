import Router from "koa-router";
import { languageMiddleware } from "../middleware/languageMiddleware";
import * as CertificationController from "../controllers/certificationController";

const router = new Router({ prefix: "/certifications" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.get("/", CertificationController.getAllCertifications);
router.get("/by-role", CertificationController.getCertificationsByRole);
router.get(
  "/by-roleWeb/:id",
  CertificationController.getCertificationsByRoleId
);
router.get("/:id", CertificationController.getCertificationById);
router.post("/", CertificationController.createCertification);
router.put("/:id", CertificationController.updateCertification);
router.delete("/:id", CertificationController.deleteCertification);

export default router;
