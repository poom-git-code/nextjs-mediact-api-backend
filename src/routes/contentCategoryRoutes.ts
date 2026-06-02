import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as ContentCategoryController from "../controllers/contentCategoryController";

const router = new Router({ prefix: "/content-category" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.post("/", ContentCategoryController.createCategory);
router.get("/", ContentCategoryController.getAllCategories);
router.get("/management", ContentCategoryController.getAllCategoriesManagement);
router.get("/:id", ContentCategoryController.getCategoryById);
router.put("/:id", ContentCategoryController.updateCategory);
router.delete("/:id", ContentCategoryController.deleteCategory);

export default router;