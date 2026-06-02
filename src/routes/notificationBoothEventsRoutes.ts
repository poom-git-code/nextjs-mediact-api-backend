import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as NotificationBoothEventController from "../controllers/notificationBoothEventsController";

const router = new Router({ prefix: "/notification-booth-events" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// Create a new notification and assign to users
router.post("/", NotificationBoothEventController.createNotification);
router.post("/no-job", NotificationBoothEventController.createNotificationNoJob);

// Get all notifications
router.get("/", NotificationBoothEventController.getAllNotifications);

// Get a specific notification by ID
router.get("/:id", NotificationBoothEventController.getNotificationById);

// Update a notification by ID
router.put("/:id", NotificationBoothEventController.updateNotification);

// Soft-delete or deactivate a notification
router.delete("/:id", NotificationBoothEventController.deleteNotification);

export default router;
