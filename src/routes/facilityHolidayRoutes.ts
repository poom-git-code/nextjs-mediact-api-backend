import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as facilityHolidayController from "../controllers/facilityHolidayController";

const router = new Router({ prefix: "/partner/facility-holidays" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// Create a new facility holiday
router.post("/", facilityHolidayController.createFacilityHoliday);

// Get all holidays for a specific facility
router.get("/facility/:facility_id", facilityHolidayController.getFacilityHolidaysByFacilityId);

// Get a specific holiday by ID
router.get("/:id", facilityHolidayController.getFacilityHolidayById);

// Update a holiday
router.put("/:id", facilityHolidayController.updateFacilityHoliday);

// Delete a holiday
router.delete("/:id", facilityHolidayController.deleteFacilityHoliday);

export default router;
