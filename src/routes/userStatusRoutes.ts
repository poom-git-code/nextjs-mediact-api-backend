import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as UserStatusController from '../controllers/userStatusController';

const router = new Router({ prefix: '/user-statuses' });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.post('/', UserStatusController.assignStatusToUser);
router.put('/:id', UserStatusController.updateUserStatus);
router.delete('/:id', UserStatusController.deleteUserStatus);
router.get('/user/:user_id', UserStatusController.getUserStatuses);
router.get('/', UserStatusController.getAllUserStatuses);

export default router;
