import { Context } from "koa";
import { generateOTP, verifyOTP } from "../services/otpService";
import { sendEmail } from "../services/emailService";

export const sendOTP = async (ctx: Context) => {
  const { email } = ctx.request.body;

  if (!email) {
    ctx.status = 400;
    ctx.body = { error: "Email is required" };
    return;
  }

  const otp = generateOTP(email);
  try {
    await sendEmail(email, "Your OTP Code", `Your OTP code is ${otp}`);
    ctx.status = 200;
    ctx.body = { message: "OTP sent successfully" };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: "Failed to send OTP" };
  }
};

export const verifyOTPController = async (ctx: Context) => {
  const { email, otp } = ctx.request.body;

  if (!email || !otp) {
    ctx.status = 400;
    ctx.body = { error: "Email and OTP are required" };
    return;
  }

  const isValid = verifyOTP(email, otp);
  if (isValid) {
    ctx.status = 200;
    ctx.body = { message: "OTP verified successfully" };
  } else {
    ctx.status = 400;
    ctx.body = { error: "Invalid or expired OTP" };
  }
};