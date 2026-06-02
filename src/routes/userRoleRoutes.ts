import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as UserRoleController from '../controllers/userRoleController';

const router = new Router();

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.post('/user-roles', UserRoleController.assignRoleToUser);
router.put('/user-roles/:id', UserRoleController.updateUserRole);
router.delete('/user-roles/:id', UserRoleController.deleteUserRole);
router.get('/user-roles/:user_id', UserRoleController.getUserRoles);
router.get('/user-roles', UserRoleController.getAllUserRoles);

export default router;