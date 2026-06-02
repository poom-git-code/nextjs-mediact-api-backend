import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as DepartmentOperatingHoursController from '../controllers/departmentOperatingHoursController';

const router = new Router();

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// CRUD operations
router.post('/department-operating-hours', DepartmentOperatingHoursController.createDepartmentOperatingHours);
router.put('/department-operating-hours/:id', DepartmentOperatingHoursController.updateDepartmentOperatingHours);
router.delete('/department-operating-hours/:id', DepartmentOperatingHoursController.deleteDepartmentOperatingHours);
router.get('/department-operating-hours', DepartmentOperatingHoursController.getAllDepartmentOperatingHours);
router.get('/department-operating-hours/:id', DepartmentOperatingHoursController.getDepartmentOperatingHoursById);

// Additional endpoints
router.get('/department-operating-hours/department/:departmentId', DepartmentOperatingHoursController.getDepartmentOperatingHoursByDepartment);
router.get('/department-operating-hours/weekday/:weekday', DepartmentOperatingHoursController.getDepartmentOperatingHoursByWeekday);

export default router;
