import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as ProvinceController from "../controllers/provinceController";

const router = new Router({ prefix: "/provinces" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.get("/", ProvinceController.getAllProvinces);
router.get("/:id", ProvinceController.getProvinceById);
router.post("/", ProvinceController.createProvince);
router.put("/:id", ProvinceController.updateProvince);
router.delete("/:id", ProvinceController.deleteProvince);

export default router;