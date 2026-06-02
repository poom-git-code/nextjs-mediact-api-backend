import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as NotificationRecipientController from "../controllers/notificationRecipientEventsController";

const router = new Router({ prefix: "/notification-recipient-events" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.post("/", NotificationRecipientController.createRecipients);
router.get("/:notification_id", NotificationRecipientController.getRecipientsByNotification);
router.put("/:notification_id/mark-read", NotificationRecipientController.markNotificationAsRead);
router.put("/:notification_id/mark-responded", NotificationRecipientController.markNotificationAsResponded);

router.get("/my-notifications", NotificationRecipientController.getUserNotifications);


export default router;
