// src/routes/notifications.routes.ts
import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as NotificationsController from '../controllers/notificationsController';

const router = new Router({ prefix: '/notifications' });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.post('/send', NotificationsController.sendNotification);
router.get('/my', NotificationsController.getMyNotifications);
router.get('/my/paging', NotificationsController.getMyNotificationsWithPaging);
router.put('/:id/read', NotificationsController.markAsRead);
router.put('/read-all', NotificationsController.markAllAsRead);

export default router;