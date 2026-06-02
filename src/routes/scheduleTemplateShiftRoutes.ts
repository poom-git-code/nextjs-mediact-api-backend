import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as ScheduleTemplateShiftController from '../controllers/scheduleTemplateShiftController';

const router = new Router();

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.post('/schedule-template-shifts', ScheduleTemplateShiftController.createScheduleTemplateShift);
router.put('/schedule-template-shifts/:id', ScheduleTemplateShiftController.updateScheduleTemplateShift);
router.delete('/schedule-template-shifts/:id', ScheduleTemplateShiftController.deleteScheduleTemplateShift);
router.get('/schedule-template-shifts/:id', ScheduleTemplateShiftController.getScheduleTemplateShiftById);
router.get('/schedule-template-shifts', ScheduleTemplateShiftController.getAllScheduleTemplateShifts);

export default router;