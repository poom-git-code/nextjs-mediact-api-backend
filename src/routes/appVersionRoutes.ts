import Router from "koa-router";
import * as AppController from "../controllers/appVersionController";

const router = new Router({ prefix: "/app" });

router.get("/versions", AppController.getAppVersions);

export default router;
