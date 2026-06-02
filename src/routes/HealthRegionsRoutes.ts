import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as HealthRegionsController from "../controllers/healthRegionsController";

const router = new Router({ prefix: "/health-regions" });

router.use(languageMiddleware);

router.get("/", HealthRegionsController.getAllHealthRegions);
router.get("/:id", HealthRegionsController.getHealthRegionById);
router.post("/", HealthRegionsController.createHealthRegion);
router.put("/:id", HealthRegionsController.updateHealthRegion);
router.delete("/:id", HealthRegionsController.deleteHealthRegion);

export default router;