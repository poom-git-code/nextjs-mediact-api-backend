import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as WorkAreasController from "../controllers/workAreasController";

const router = new Router({ prefix: "/work-areas" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// create
router.post("/", WorkAreasController.createWorkArea);

// update
router.put("/:id", WorkAreasController.updateWorkArea);

// delete
router.delete("/:id", WorkAreasController.deleteWorkArea);

// get all
router.get("/", WorkAreasController.getAllWorkAreas);

// get by user 
router.get("/user", WorkAreasController.getWorkAreasByUserId);

export default router;
