import Router from 'koa-router';
import CategoryController from '../controllers/categoryMasterController';
import { languageMiddleware } from '../middleware/languageMiddleware';

const router = new Router({ prefix: "/category-master" });

router.use(languageMiddleware);

router.get('/', CategoryController.getAllCategories);
router.get('/by-user-role', CategoryController.getCategoriesByUserRole);

export default router;
