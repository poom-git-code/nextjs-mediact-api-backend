import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import { sendOTP, verifyOTPController } from "../controllers/otpController";

const otpRouter = new Router();

otpRouter.post("/send-otp", sendOTP);
otpRouter.post("/verify-otp", verifyOTPController);

export default otpRouter;