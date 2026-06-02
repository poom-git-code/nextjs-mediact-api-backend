import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as Controller from "../controllers/ShiftCommentsController";

const router = new Router({ prefix: "/shift-comments" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.post("/", Controller.createShiftComment);
router.get("/", Controller.getShiftComments);
router.get("/shift/:shift_id", Controller.getShiftCommentsByShiftId);
router.get("/:id", Controller.getShiftCommentById);
router.put("/:id", Controller.updateShiftComment);
router.delete("/:id", Controller.deleteShiftComment);

router.get(
  "/to-target/:swapRequestId",
  Controller.getSwapRequestCommentsToTarget
);

router.get(
  "/shift-master/:shift_id",
  Controller.getShiftCommentsByShiftIdMaster
);

export default router;
