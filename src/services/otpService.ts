import crypto from "crypto";

const otpStore: { [key: string]: { otp: string; expires: number } } = {};

export const generateOTP = (email: string): string => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const expires = Date.now() + 5 * 60 * 1000; // OTP หมดอายุใน 5 นาที
  otpStore[email] = { otp, expires };
  return otp;
};

export const verifyOTP = (email: string, otp: string): boolean => {
  const record = otpStore[email];
  if (!record) return false;
  if (record.expires < Date.now()) {
    delete otpStore[email];
    return false;
  }
  if (record.otp !== otp) return false;
  delete otpStore[email];
  return true;
};