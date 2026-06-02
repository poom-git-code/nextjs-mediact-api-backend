import Router from "koa-router";
import * as DepartmentController from "../controllers/departmentController";
import { languageMiddleware } from "../middleware/languageMiddleware";

const router = new Router();

// เพิ่ม language middleware ให้ทุก department route
router.use(languageMiddleware);

router.post("/departments", DepartmentController.createDepartment);
router.put("/departments/:id", DepartmentController.updateDepartment);
router.delete("/departments/:id", DepartmentController.deleteDepartment);
router.get("/departments", DepartmentController.getAllDepartments);
// router.get('/departments/facility', DepartmentController.getDepartmentsByFacility);
router.get("/departments/:id", DepartmentController.getDepartmentById);
router.get(
  "/departments/:id/details",
  DepartmentController.getDepartmentByIdWithDetails
);
router.get(
  "/departments/facility/:facility_id",
  DepartmentController.getDepartmentByFacilityId
);

// Partner group
router.get(
  "/partner/departments/facility",
  DepartmentController.getPartnerDepartmentByFacility
);
router.get(
  "/partner/departments/supervisor",
  DepartmentController.getDepartmentsBySupervisor
);
router.post(
  "/partner/departments",
  DepartmentController.createPartnerDepartment
);
router.put("/partner/departments/:id", DepartmentController.updateDepartment);
router.delete(
  "/partner/departments/:id",
  DepartmentController.deleteDepartment
);
router.get(
  "/partner/departments/facility/:facility_id",
  DepartmentController.getPartnerDepartmentByFacilityId
);

router.get(
  "/partner/departments/dropdown",
  DepartmentController.getDepartmentsForDropdownController
);

router.delete(
  "/departments/:id/members/:userId",
  DepartmentController.removeMemberFromDepartment
);

export default router;
