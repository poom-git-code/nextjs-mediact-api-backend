import Router from 'koa-router';
import SubCategoryController from '../controllers/subCategoryMasterController';
import { languageMiddleware } from '../middleware/languageMiddleware';

const router = new Router({ prefix: "/sub-categories-master" });

router.use(languageMiddleware);

router.get('/backoffice', SubCategoryController.getAllSubCategoriesBackoffice);

router.get('/:id', SubCategoryController.getSubCategoryById);

router.post('/', SubCategoryController.createSubCategory);

router.put('/:id', SubCategoryController.updateSubCategory);

router.delete('/:id', SubCategoryController.deleteSubCategory);

router.get('/', SubCategoryController.getAllSubCategories);

router.get('/by-category/:categoryId', SubCategoryController.getSubCategoriesByCategoryId);

export default router;