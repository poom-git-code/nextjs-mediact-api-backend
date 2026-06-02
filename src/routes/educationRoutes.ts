import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as educationController from '../controllers/educationController';

const router = new Router();

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.get('/educations', educationController.getAllEducations);
router.get('/educations/:id', educationController.getEducationById);
router.post('/educations', educationController.createEducation);
router.put('/educations/:id', educationController.updateEducation);
router.delete('/educations/:id', educationController.deleteEducation);

export default router;