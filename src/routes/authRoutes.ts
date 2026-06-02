import Router from "koa-router";
import * as AuthController from "../controllers/authController";
import { languageMiddleware } from "../middleware/languageMiddleware";
import { ro } from "date-fns/locale";

const router = new Router();

// เพิ่ม language middleware ให้ทุก auth route
router.use(languageMiddleware);

// Mobile ReDesign
router.post("/auth/mobile/sign-up", AuthController.registerV2);
router.post(
  "/auth/mobile/request-email-verification-register",
  AuthController.requestEmailVerificationRegister
);
router.post(
  "/auth/mobile/verify-email-register",
  AuthController.verifyOtpEmailRegister
);
router.post(
  "/auth/mobile/resend-otp-register",
  AuthController.resendOtpRegister
);

// Common Auth Routes
router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login);
router.post("/auth/login-v2", AuthController.loginV2);
router.post(
  "/auth/request-reset-password",
  AuthController.requestPasswordReset
);
router.post("/auth/verify-otp", AuthController.verifyOtp);
router.post("/auth/resend-otp", AuthController.resendOtp);
router.post("/auth/reset-password", AuthController.resetPassword);
router.post("/auth/reset-password-need", AuthController.resetPasswordNeed);
router.post("/auth/refresh-token", AuthController.refreshToken);
router.post("/auth/revoke-refresh-token", AuthController.revokeRefreshToken);
router.post("/auth/logout", AuthController.logout);

// Email and Phone Verification
router.post(
  "/auth/mobile/request-email-verification",
  AuthController.requestEmailVerification
);
router.post(
  "/auth/mobile/request-phone-verification",
  AuthController.requestPhoneVerification
);
router.post("/auth/mobile/verify-email", AuthController.verifyOtpEmail);
router.post("/auth/mobile/verify-phone", AuthController.verifyOtpPhoneNumber);

// Partner group
router.post("/partner/auth/login", AuthController.backEndLogin);
router.post("/partner/auth/refresh-token", AuthController.refreshToken);
router.post("/partner/auth/logout", AuthController.logout);

// --- อันใหม่: ดึง Token "อันล่าสุด" ของ User ID นี้ ---
router.get(
  "/partner/auth/latest-token/:userId",
  AuthController.getLatestTokenByUserId
);

export default router;
