import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as ScheduleShiftController from '../controllers/scheduleShiftController';

const router = new Router();

router.use(languageMiddleware);

router.post('/schedule-shifts', ScheduleShiftController.createScheduleShift);
router.get('/schedule-shifts/user', ScheduleShiftController.getSchedulesByUser);
router.post('/schedule-shifts/user/by-date', ScheduleShiftController.getSchedulesByDate);
router.post('/schedule-shifts/by-user-and-date', ScheduleShiftController.getSchedulesByUserIdAndDate);
router.post('/schedule-shifts/by-user-and-date-for-transfer-shift', ScheduleShiftController.getSchedulesByUserIdAndDateForTransferShift);
router.get('/schedule-shifts/user/week', ScheduleShiftController.getSchedulesByUserPerWeek);
router.get('/schedule-shifts/user/department', ScheduleShiftController.getSchedulesByUserOnDepartment);
router.put('/schedule-shifts/:id', ScheduleShiftController.updateScheduleShift);
router.delete('/schedule-shifts/:id', ScheduleShiftController.deleteScheduleShift);
router.get('/schedule-shifts', ScheduleShiftController.getAllScheduleShifts);
router.get('/schedule-shifts/schedule-master/:id', ScheduleShiftController.getAllScheduleShiftsByScheduleMasterId);
router.get('/schedule-shifts/facility', ScheduleShiftController.getScheduleShiftByFacility);
router.get('/schedule-shifts/:id', ScheduleShiftController.getScheduleShiftById);

router.get('/schedule-shifts/facility/grouped', ScheduleShiftController.getGroupedScheduleShifts);

export default router;