import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as UserDeviceController from "../controllers/userDeviceController";

const router = new Router({ prefix: "/user-devices" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.post("/register", UserDeviceController.registerDevice);
router.put("/update", UserDeviceController.updateDevice);
router.put("/deactivate", UserDeviceController.deactivateDevice);
router.get("/my", UserDeviceController.getMyDevices); // user ดู device ตัวเอง

// Admin route
router.get("/admin/user/:user_id", UserDeviceController.getUserDevicesByAdmin);

export default router;