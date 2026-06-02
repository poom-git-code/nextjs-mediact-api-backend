import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const secret: Secret = process.env.JWT_SECRET || 'default_secret';
// const accessTokenExpiresIn: jwt.SignOptions['expiresIn'] = '15m'; // Short-lived access token
// const refreshTokenExpiresIn: jwt.SignOptions['expiresIn'] = '7d'; // Long-lived refresh token

const accessTokenExpiresIn: jwt.SignOptions['expiresIn'] = '45d'; // Short-lived access token
const refreshTokenExpiresIn: jwt.SignOptions['expiresIn'] = '90d'; // Long-lived refresh token

export const signAccessToken = (payload: object): string => {
  const options: SignOptions = { expiresIn: accessTokenExpiresIn };
  return jwt.sign(payload, secret, options);
};

export const signRefreshToken = (payload: object): string => {
  const options: SignOptions = { expiresIn: refreshTokenExpiresIn };
  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string): object | string => {
  return jwt.verify(token, secret);
};

// Keep the old function for backward compatibility
export const signToken = (payload: object): string => {
  return signAccessToken(payload);
};

// export const getAccessTokenExpiry = (): number => {
//   // Return expiry in milliseconds (15 minutes)
//   return 15 * 60 * 1000;
// };

// export const getRefreshTokenExpiry = (): number => {
//   // Return expiry in milliseconds (7 days)
//   return 7 * 24 * 60 * 60 * 1000;
// };

export const getAccessTokenExpiry = (): number => {
  // Return expiry in milliseconds (15 minutes)
  return 45 * 24 * 60 * 60 * 1000;
};

export const getRefreshTokenExpiry = (): number => {
  // Return expiry in milliseconds (7 days)
  return 90 * 24 * 60 * 60 * 1000;
};