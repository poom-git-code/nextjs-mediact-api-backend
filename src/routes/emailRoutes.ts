import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import { sendEmailController } from "../controllers/emailController";

const emailRouter = new Router();

emailRouter.post("/send-email", sendEmailController);

export default emailRouter;