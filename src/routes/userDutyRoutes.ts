import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as UserDutyController from '../controllers/userDutyController';
import { authenticate } from '../middlewares/auth.middleware';

const router = new Router({ prefix: '/user-duties' });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// Apply authentication middleware to all routes
router.use(authenticate);

// CRUD Routes
router.post('/', UserDutyController.createUserDuty);
router.put('/:id', UserDutyController.updateUserDuty);
router.delete('/:id', UserDutyController.deleteUserDuty);
router.get('/:id', UserDutyController.getUserDutyById);
router.get('/', UserDutyController.getAllUserDuties);

// Additional Routes
router.get('/user/:userId', UserDutyController.getUserDutiesByUser);
router.get('/user/:userId/date/:dutyDate', UserDutyController.getUserDutyByUserAndDate);
router.get('/calendar/:userId/:year/:month', UserDutyController.getUserDutyCalendar);
router.get('/stats/summary', UserDutyController.getUserDutyStats);
router.put('/bulk/update', UserDutyController.bulkUpdateUserDuties);

export default router;
