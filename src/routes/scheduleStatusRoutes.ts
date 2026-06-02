import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as ScheduleStatusController from '../controllers/scheduleStatusController';

const router = new Router();

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.post('/schedule-statuses', ScheduleStatusController.createScheduleStatus);
router.put('/schedule-statuses/:id', ScheduleStatusController.updateScheduleStatus);
router.delete('/schedule-statuses/:id', ScheduleStatusController.deleteScheduleStatus);
router.get('/schedule-statuses/:id', ScheduleStatusController.getScheduleStatusById);
router.get('/schedule-statuses', ScheduleStatusController.getAllScheduleStatuses);

export default router;