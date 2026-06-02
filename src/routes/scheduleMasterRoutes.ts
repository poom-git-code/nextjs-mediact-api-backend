import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as ScheduleMasterController from '../controllers/scheduleMasterController';

const router = new Router();

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.post('/schedule-masters', ScheduleMasterController.createScheduleMaster);
router.put('/schedule-masters/:id', ScheduleMasterController.updateScheduleMaster);
router.delete('/schedule-masters/:id', ScheduleMasterController.deleteScheduleMaster);
router.get('/schedule-masters/search', ScheduleMasterController.getScheduleMastersByMonthYearDepartment);
router.get('/schedule-masters/:id', ScheduleMasterController.getScheduleMasterById);
router.get('/schedule-masters', ScheduleMasterController.getAllScheduleMasters);

export default router;