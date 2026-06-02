import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as UserEmploymentController from '../controllers/userEmploymentController';

const router = new Router();

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.get('/user-employments/audience', UserEmploymentController.getJobAudience);

router.post('/user-employments', UserEmploymentController.createEmployment);
router.put('/user-employments/:id', UserEmploymentController.updateEmployment);
router.delete('/user-employments/:id', UserEmploymentController.deleteEmployment);
router.get('/user-employments/:id', UserEmploymentController.getEmploymentById);
router.get('/user-employments/user/:user_id', UserEmploymentController.getEmploymentsByUser);
router.get('/user-employments', UserEmploymentController.getAllEmployments);

export default router;