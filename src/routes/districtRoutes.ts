import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as DistrictController from "../controllers/districtController";

const router = new Router({ prefix: "/districts" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.get("/", DistrictController.getAllDistricts);
router.get("/:id", DistrictController.getDistrictById);
router.get("/province/:province_code", DistrictController.getDistrictsByProvinceCode);
router.post("/", DistrictController.createDistrict);
router.put("/:id", DistrictController.updateDistrict);
router.delete("/:id", DistrictController.deleteDistrict);

export default router;