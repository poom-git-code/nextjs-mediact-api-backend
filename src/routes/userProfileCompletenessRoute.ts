import Router from "koa-router";
import * as ProfileCompletenessController from "../controllers/userProfileCompletenessController";

const router = new Router({ prefix: "/profile-completeness" });

router.post("/:id/calculate", ProfileCompletenessController.calculateProfileCompleteness);

export default router;
