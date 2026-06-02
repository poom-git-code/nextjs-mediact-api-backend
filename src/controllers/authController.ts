import { Context } from "koa";
import Joi from "joi";
import {
  loginSchema,
  loginV2Schema,
  registerSchema,
  registerV2Schema,
  requestResetSchema,
  resetPasswordNeedSchema,
  resetPasswordSchema,
} from "../validations/authValidation";
import * as AuthService from "../services/authService";
import * as RefreshTokenService from "../services/refreshTokenService";

export const register = async (ctx: Context) => {
  try {
    console.log("ctx.request.body", ctx.request.body);

    const {
      username,
      email,
      password,
      first_name,
      last_name,
      phone_number,
      gender_id,
      role_id,
    } = ctx.request.body;

    // const { username, email, password, first_name, last_name, phone_number, role_id } =
    //   await registerSchema.validateAsync(ctx.request.body);

    // console.log("1111111");

    const user = await AuthService.registerUser(
      username,
      email,
      password,
      first_name,
      last_name,
      phone_number,
      gender_id,
      role_id
    );

    // console.log("222222");

    ctx.status = 201;
    ctx.body = { message: "User registered successfully", user };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const login = async (ctx: Context) => {
  try {
    console.log("ctx.request.body", ctx.request.body);
    const { email, password } = await loginSchema.validateAsync(
      ctx.request.body
    );
    console.log("identifier:", email, "password:", password);
    const { token, user } = await AuthService.loginUser(email, password);
    ctx.body = { message: "Login successful", token, user };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const loginV2 = async (ctx: Context) => {
  console.log("ctx.request.body", ctx.request.body);
  try {
    const { identifier, password } = await loginV2Schema.validateAsync(
      ctx.request.body
    );
    const { token, user } = await AuthService.loginUserV2(identifier, password);
    ctx.body = { message: "Login successful", token, user };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const backEndLogin = async (ctx: Context) => {
  try {
    console.log("=========== backEndLogin START ==========");
    console.log("=========== backEndLogin, ctx.request.body", ctx.request.body);
    console.log("Method:", ctx.method);
    console.log("URL:", ctx.url);
    console.log("Headers:", ctx.headers);

    // const { identifier, password } = await loginSchema.validateAsync(
    //   ctx.request.body
    // );

    const { identifier, password } = ctx.request.body;
    console.log(
      "Extracted identifier:",
      identifier,
      "password:",
      password ? "[HIDDEN]" : "undefined"
    );

    const { token, user } = await AuthService.backEndLoginUser(
      identifier,
      password
    );

    console.log("Login successful, user ID:", user.id);
    ctx.body = { message: "Login successful", token, user };
  } catch (error) {
    console.log("=========== backEndLogin ERROR ==========");
    console.log("Error:", error);

    // Handle role permission errors with specific status code
    if (error instanceof Error && error.message.includes("Access denied")) {
      ctx.status = 403;
      ctx.body = { error: error.message };
    } else {
      ctx.status = 400;
      if (error instanceof Joi.ValidationError) {
        ctx.body = { error: error.details[0].message };
      } else if (error instanceof Error) {
        ctx.body = { error: error.message };
      } else {
        ctx.body = { error: "Unknown error occurred" };
      }
    }
  }
};

export const requestPasswordReset = async (ctx: Context) => {
  try {
    const { email } = await requestResetSchema.validateAsync(ctx.request.body);
    const result = await AuthService.requestPasswordReset(email);
    ctx.body = result; // Send response
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const verifyOtp = async (ctx: Context) => {
  const { email, otp, ref } = ctx.request.body;
  try {
    const response = await AuthService.verifyOtp(email, otp, ref);
    ctx.body = response;
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const resendOtp = async (ctx: Context) => {
  const { email } = ctx.request.body;
  try {
    const response = await AuthService.resendOtp(email);
    ctx.body = response;
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const resetPassword = async (ctx: Context) => {
  try {
    const { email, newPassword } = await resetPasswordSchema.validateAsync(
      ctx.request.body
    );
    console.log("Request body:", ctx.request.body);
    // Validate input
    const result = await AuthService.resetPassword(email, newPassword);
    ctx.body = result; // Send response
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const resetPasswordNeed = async (ctx: Context) => {
  try {
    const { userId, newPassword } = await resetPasswordNeedSchema.validateAsync(
      ctx.request.body
    ); // Validate input
    const result = await AuthService.resetPasswordNeed(userId, newPassword);
    ctx.body = result; // Send response
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const refreshToken = async (ctx: Context) => {
  try {
    const { refreshToken } = ctx.request.body;

    if (!refreshToken) {
      ctx.status = 400;
      ctx.body = { error: "Refresh token is required" };
      return;
    }

    const deviceInfo = ctx.headers["user-agent"] || undefined;
    const ipAddress = ctx.ip || undefined;

    const result = await RefreshTokenService.refreshTokens(
      refreshToken,
      deviceInfo,
      ipAddress
    );

    ctx.body = {
      message: "Tokens refreshed successfully",
      token: result.accessToken,
      refreshToken: result.refreshToken,
      expiresAt: result.expiresAt,
      user: {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        first_name: result.user.first_name,
        last_name: result.user.last_name,
      },
    };
  } catch (error) {
    ctx.status = 401;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Invalid refresh token" };
    }
  }
};

export const revokeRefreshToken = async (ctx: Context) => {
  try {
    const { refreshToken } = ctx.request.body;

    if (!refreshToken) {
      ctx.status = 400;
      ctx.body = { error: "Refresh token is required" };
      return;
    }

    await RefreshTokenService.revokeRefreshToken(refreshToken);
    ctx.body = { message: "Refresh token revoked successfully" };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const logout = async (ctx: Context) => {
  try {
    const { refreshToken } = ctx.request.body;

    if (refreshToken) {
      await RefreshTokenService.revokeRefreshToken(refreshToken);
    }

    ctx.body = { message: "Logged out successfully" };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const requestEmailVerification = async (ctx: Context) => {
  try {
    const { email } = ctx.request.body;

    if (!email) {
      ctx.status = 400;
      ctx.body = { error: "Email is required" };
      return;
    }

    const result = await AuthService.requestEmailVerification(email);
    ctx.body = result;
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const requestPhoneVerification = async (ctx: Context) => {
  try {
    // console.log("requestPhoneVerification body:", ctx.request.body);
    const { phone_number } = ctx.request.body;

    if (!phone_number) {
      console.log("Phone number is missing");
      ctx.status = 400;
      ctx.body = { error: "Phone number is required" };
      return;
    }

    // console.log("Calling AuthService.requestPhoneVerification with:", phone_number);
    const result = await AuthService.requestPhoneVerification(phone_number);
    // console.log("AuthService result:", result);
    ctx.body = result;
  } catch (error) {
    console.error("Error in requestPhoneVerification controller:", error);
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const verifyOtpEmail = async (ctx: Context) => {
  try {
    const { email, otp, ref } = ctx.request.body;

    if (!email || !otp || !ref) {
      ctx.status = 400;
      ctx.body = { error: "Email, OTP, and Ref are required" };
      return;
    }

    const response = await AuthService.verifyOtpEmail(email, otp, ref);
    ctx.body = response;
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const verifyOtpPhoneNumber = async (ctx: Context) => {
  try {
    const { phone_number, otp, ref } = ctx.request.body;

    if (!phone_number || !otp || !ref) {
      ctx.status = 400;
      ctx.body = { error: "Phone number, OTP, and Ref are required" };
      return;
    }

    const response = await AuthService.verifyOtpPhoneNumber(
      phone_number,
      otp,
      ref
    );
    ctx.body = response;
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

// --- Mobile ReDesign ---

export const registerV2 = async (ctx: Context) => {
  try {
    console.log("registerV2 - ctx.request.body", ctx.request.body);

    const { role_id, email, password, phone_number, is_verified_email } =
      await registerV2Schema.validateAsync(ctx.request.body);

    const user = await AuthService.registerUserV2(
      role_id,
      email,
      password,
      phone_number,
      is_verified_email
    );

    ctx.status = 201;
    ctx.body = { message: "User registered successfully", user };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const requestEmailVerificationRegister = async (ctx: Context) => {
  try {
    const { email } = ctx.request.body;

    if (!email) {
      ctx.status = 400;
      ctx.body = { error: "Email is required" };
      return;
    }

    const result = await AuthService.requestEmailVerificationRegister(email);
    ctx.body = result;
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const resendOtpRegister = async (ctx: Context) => {
  const { email } = ctx.request.body;
  try {
    const response = await AuthService.resendOtpRegister(email);
    ctx.body = response;
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const verifyOtpEmailRegister = async (ctx: Context) => {
  try {
    const { email, otp, ref } = ctx.request.body;

    if (!email || !otp || !ref) {
      ctx.status = 400;
      ctx.body = { error: "Email, OTP, and Ref are required" };
      return;
    }

    const response = await AuthService.verifyOtpEmailRegister(email, otp, ref);
    ctx.body = response;
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const getLatestTokenByUserId = async (ctx: Context) => {
  try {
    // 1. ลองดึงจาก Params ก่อน (กรณี /partner/auth/latest-token/:userId)
    let targetUserId = ctx.params.userId;

    // 2. ถ้าไม่มีใน Params ให้ลองดึงจาก Token (ctx.state.user)
    // (ใช้กรณีเรียกแบบ /partner/auth/latest-token เฉยๆ โดยไม่มี ID)
    if (!targetUserId && ctx.state.user && ctx.state.user.id) {
      targetUserId = ctx.state.user.id;
    }

    // 3. ถ้าหาไม่เจอทั้งคู่ ให้แจ้ง Error
    if (!targetUserId) {
      ctx.status = 400;
      ctx.body = { error: "User ID is required (via params or token)" };
      return;
    }

    // 4. เรียก Service (แปลงเป็น Int ให้ชัวร์)
    const tokenData = await RefreshTokenService.getLatestRefreshTokenByUserId(
      parseInt(targetUserId.toString())
    );

    ctx.body = tokenData;
  } catch (error) {
    ctx.status = 404;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};
