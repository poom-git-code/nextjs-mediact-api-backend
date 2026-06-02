import Router from "koa-router";
import { languageMiddleware } from "../middleware/languageMiddleware";
import * as AutoUnsubscribeController from "../controllers/autoUnsubscribeController";

const router = new Router({ prefix: "/auto-unsubscribe" });

router.use(languageMiddleware);

// POST /auto-unsubscribe/send
router.post("/send", AutoUnsubscribeController.sendAutoUnsubscribe);

export default router;
