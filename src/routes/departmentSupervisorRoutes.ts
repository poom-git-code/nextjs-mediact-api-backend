import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as DepartmentSupervisorController from '../controllers/departmentSupervisorController';

const router = new Router();

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// CRUD operations
router.post('/department-supervisors', DepartmentSupervisorController.createDepartmentSupervisor);
router.put('/department-supervisors/:id', DepartmentSupervisorController.updateDepartmentSupervisor);
router.delete('/department-supervisors/:id', DepartmentSupervisorController.deleteDepartmentSupervisor);
router.get('/department-supervisors', DepartmentSupervisorController.getAllDepartmentSupervisors);
router.get('/department-supervisors/:id', DepartmentSupervisorController.getDepartmentSupervisorById);

// Additional endpoints
router.get('/department-supervisors/department/:departmentId', DepartmentSupervisorController.getDepartmentSupervisorsByDepartment);
router.get('/department-supervisors/user/:userId', DepartmentSupervisorController.getDepartmentSupervisorsByUser);

export default router;
