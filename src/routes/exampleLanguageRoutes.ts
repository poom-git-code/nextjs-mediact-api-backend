import Router from 'koa-router';
import * as ExampleController from '../controllers/exampleLanguageController';
import { languageMiddleware } from '../middleware/languageMiddleware';

const router = new Router({ prefix: "/example" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// Example routes เพื่อทดสอบการใช้งาน language parameter
router.get('/test', ExampleController.exampleWithLanguage);
router.get('/user/:id', ExampleController.getUserInfoWithLanguage);
router.post('/user', ExampleController.createUserWithLanguage);

export default router;
