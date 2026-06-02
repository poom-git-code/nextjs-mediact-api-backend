import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as SubdistrictController from "../controllers/subdistrictController";

const router = new Router({ prefix: "/subdistricts" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.get("/", SubdistrictController.getAllSubdistricts);
router.get("/:id", SubdistrictController.getSubdistrictById);
router.get("/district/:district_code", SubdistrictController.getSubdistrictsByDistrictCode);
router.post("/", SubdistrictController.createSubdistrict);
router.put("/:id", SubdistrictController.updateSubdistrict);
router.delete("/:id", SubdistrictController.deleteSubdistrict);

export default router;