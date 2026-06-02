import Router from "koa-router";
import * as DepartmentCertificationController from "../controllers/departmentCertificationController";
import { languageMiddleware } from "../middleware/languageMiddleware";

const router = new Router({
  prefix: "/partner/departments",
});

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// GET /partner/departments/:department_id/certifications
router.get(
  "/:department_id/certifications",
  DepartmentCertificationController.getCertificationsForDepartment
);

// POST /partner/departments/:department_id/certifications
router.post(
  "/:department_id/certifications",
  DepartmentCertificationController.addCertificationToDepartment
);

// DELETE /partner/departments/:department_id/certifications/:certification_id
router.delete(
  "/:department_id/certifications/:certification_id",
  DepartmentCertificationController.removeCertificationFromDepartment
);

export default router;
