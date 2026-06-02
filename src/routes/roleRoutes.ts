import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as RoleController from '../controllers/roleController';

const router = new Router();

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);
const publicRouter = new Router();

router.post('/roles', RoleController.createRole);
router.put('/roles/:id', RoleController.updateRole);
router.delete('/roles/:id', RoleController.deleteRole);
router.get('/roles', RoleController.getAllRoles);
router.get('/roles/:id', RoleController.getRoleById);

// เส้นทางที่ไม่ต้องการการตรวจสอบสิทธิ์
publicRouter.get('/roles/userview', RoleController.getRolesUserView);

export { router as roleRoutes, publicRouter as publicRoleRoutes };