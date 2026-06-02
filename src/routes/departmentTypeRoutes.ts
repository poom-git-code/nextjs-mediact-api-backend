import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as DepartmentTypeController from '../controllers/departmentTypeController';

const router = new Router();

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.post('/department-types', DepartmentTypeController.createDepartmentType);
router.put('/department-types/:id', DepartmentTypeController.updateDepartmentType);
router.delete('/department-types/:id', DepartmentTypeController.deleteDepartmentType);
router.get('/department-types/:id', DepartmentTypeController.getDepartmentTypeById);
router.get('/department-types', DepartmentTypeController.getAllDepartmentTypes);

export default router;