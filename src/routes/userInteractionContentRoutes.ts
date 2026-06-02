import Router from "koa-router";
import { languageMiddleware } from "../middleware/languageMiddleware"; // <-- เพิ่ม import นี้
import * as InteractionController from "../controllers/userInteractionContentController";
import { authenticate } from "../middlewares/auth.middleware";

const router = new Router({ prefix: "/interactions" });

router.use(languageMiddleware);

router.use(authenticate);

// Endpoint สำหรับนับ View
// POST /interactions/event/123/view
router.post(
  "/:contentType/:contentIdStr/view",
  InteractionController.recordView
);

// Endpoint สำหรับ Like/Dislike
// POST /interactions/event/123/like
router.post(
  "/:contentType/:contentIdStr/:interactionType",
  InteractionController.handleInteraction
);

export default router;
