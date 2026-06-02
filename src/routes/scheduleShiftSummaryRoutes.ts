import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as ScheduleShiftSummaryController from '../controllers/scheduleShiftSummaryController';

const router = new Router();

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// CRUD operations
router.post('/schedule-shift-summaries', ScheduleShiftSummaryController.createScheduleShiftSummary);
router.put('/schedule-shift-summaries/:id', ScheduleShiftSummaryController.updateScheduleShiftSummary);
router.delete('/schedule-shift-summaries/:id', ScheduleShiftSummaryController.deleteScheduleShiftSummary);
router.get('/schedule-shift-summaries/:id', ScheduleShiftSummaryController.getScheduleShiftSummaryById);
router.get('/schedule-shift-summaries', ScheduleShiftSummaryController.getAllScheduleShiftSummaries);

// Utility endpoints
router.get('/schedule-shift-summaries/active/list', ScheduleShiftSummaryController.getActiveScheduleShiftSummaries);
router.get('/schedule-shift-summaries/schedule-master/:scheduleId', ScheduleShiftSummaryController.getScheduleShiftSummariesByScheduleMaster);
router.get('/schedule-shift-summaries/department/:departmentId', ScheduleShiftSummaryController.getScheduleShiftSummariesByDepartment);
router.get('/schedule-shift-summaries/shift-type/:shiftTypeId', ScheduleShiftSummaryController.getScheduleShiftSummariesByShiftType);
router.get('/schedule-shift-summaries/stats/overview', ScheduleShiftSummaryController.getScheduleShiftSummaryStats);

// Bulk operations
router.patch('/schedule-shift-summaries/bulk-update', ScheduleShiftSummaryController.bulkUpdateScheduleShiftSummaries);
router.patch('/schedule-shift-summaries/:id/soft-delete', ScheduleShiftSummaryController.softDeleteScheduleShiftSummary);

// Upsert operation
router.post('/schedule-shift-summaries/upsert', ScheduleShiftSummaryController.upsertScheduleShiftSummary);

export default router;
