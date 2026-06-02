import Router from "koa-router";
import * as UserController from "../controllers/userController";
import { languageMiddleware } from "../middleware/languageMiddleware";
import { importUsersController } from "../controllers/userController"; // Add this

const router = new Router({ prefix: "/users" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.get("/mobile", UserController.getUserInfo);
router.get("/backoffice", UserController.getUserInfo);

router.put("/mobile", UserController.updateUserMobile);

router.post("/import-excel", importUsersController);
router.get("/", UserController.getAllUsers);
router.get("/facility", UserController.getUserByFacility);
router.get("/:id", UserController.getUserById);
router.post("/", UserController.createUser);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);

export default router;
