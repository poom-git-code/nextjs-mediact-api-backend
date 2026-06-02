// src/routes/notificationTypes.routes.ts
import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as NotificationTypesController from '../controllers/notificationTypesController';

const router = new Router({ prefix: '/notification-types' });

// Add language middleware for all routes
router.use(languageMiddleware);

// CRUD routes for notification types
router.post('/', NotificationTypesController.createNotificationType);
router.get('/', NotificationTypesController.getAllNotificationTypes);
router.get('/code/:code', NotificationTypesController.getNotificationTypeByCode);
router.get('/:id', NotificationTypesController.getNotificationTypeById);
router.put('/:id', NotificationTypesController.updateNotificationType);
router.patch('/:id/toggle', NotificationTypesController.toggleNotificationTypeStatus);
router.delete('/:id', NotificationTypesController.deleteNotificationType);

export default router;
