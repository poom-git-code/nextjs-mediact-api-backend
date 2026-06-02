import Router from "koa-router";
import { languageMiddleware } from "../middleware/languageMiddleware";
import {
  listBrands,
  getBrand,
  createBrandController,
  updateBrandController,
  deleteBrandController,
  activateBrandController,
  searchBrandsController,
} from "../controllers/brandsController";

// ==========================================
// 📱 MOBILE APP ROUTES
// ==========================================
// เฉพาะข้อมูลที่ is_active = true เท่านั้น
const mobileRouter = new Router({ prefix: "/mobile/brands" });

mobileRouter.use(languageMiddleware);

// GET /mobile/brands - Get all active brands only
mobileRouter.get("/", async (ctx) => {
  ctx.query.active = "true"; // บังคับให้เป็น active เท่านั้น
  await listBrands(ctx);
});

// GET /mobile/brands/search - Search active brands only
mobileRouter.get("/search", async (ctx) => {
  ctx.query.active = "true"; // บังคับให้เป็น active เท่านั้น
  await searchBrandsController(ctx);
});

// GET /mobile/brands/:id - Get brand by ID (active only)
mobileRouter.get("/:id", getBrand);

// ==========================================
// 🏢 BACK OFFICE ROUTES
// ==========================================
// เห็นข้อมูลทั้งหมด (active & inactive) + มี CRUD ครบ
const backofficeRouter = new Router({ prefix: "/backoffice/brands" });

backofficeRouter.use(languageMiddleware);

// GET /backoffice/brands/search - Search all brands
backofficeRouter.get("/search", searchBrandsController);

// GET /backoffice/brands - Get all brands (รวม inactive)
backofficeRouter.get("/", listBrands);

// GET /backoffice/brands/:id - Get brand by ID
backofficeRouter.get("/:id", getBrand);

// POST /backoffice/brands - Create new brand
backofficeRouter.post("/", createBrandController);

// PATCH /backoffice/brands/:id - Update brand
backofficeRouter.patch("/:id", updateBrandController);

// DELETE /backoffice/brands/:id - Delete brand (soft delete by default)
backofficeRouter.delete("/:id", deleteBrandController);

// POST /backoffice/brands/:id/activate - Activate brand
backofficeRouter.post("/:id/activate", activateBrandController);

export { mobileRouter as mobileBrandsRoutes, backofficeRouter as backofficeBrandsRoutes };
