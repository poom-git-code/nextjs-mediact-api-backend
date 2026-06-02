import * as crypto from "crypto";
import RefreshTokenModel from "../models/RefreshTokenModel";
import UserModel from "../models/UserModel";
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  getRefreshTokenExpiry,
} from "../utils/jwt";
import { PipedaUserDataHandler } from "../middleware/pipedaUserDataHandler";
import { decryptAndCleanUserData } from "../utils/encryptedFieldMapping";

export const generateTokens = async (
  user: UserModel,
  deviceInfo?: string,
  ipAddress?: string
) => {
  // Decrypt user data for token payload
  const decryptedUser = decryptAndCleanUserData(user);
  const payload = { id: decryptedUser.id, email: decryptedUser.email };

  // Generate access token
  const accessToken = signAccessToken(payload);

  // Generate refresh token
  const refreshTokenPayload = { id: user.id, type: "refresh" };
  const refreshToken = signRefreshToken(refreshTokenPayload);

  // Calculate expiry date
  const expiresAt = new Date(Date.now() + getRefreshTokenExpiry());

  // Store refresh token in database
  await RefreshTokenModel.create({
    user_id: user.id,
    token: refreshToken,
    expires_at: expiresAt,
    device_info: deviceInfo || null,
    ip_address: ipAddress || null,
  });

  return {
    accessToken,
    refreshToken,
    expiresAt,
  };
};

export const refreshTokens = async (
  refreshToken: string,
  deviceInfo?: string,
  ipAddress?: string
) => {
  try {
    //  Verify refresh token
    const decoded = verifyToken(refreshToken) as any;

    if (!decoded || decoded.type !== "refresh") {
      throw new Error("Invalid refresh token");
    }

    // Find refresh token in database
    const storedToken = await RefreshTokenModel.findOne({
      where: {
        token: refreshToken,
        is_revoked: false,
      },
      include: [
        {
          model: UserModel,
          as: "user",
        },
      ],
    });

    if (!storedToken) {
      throw new Error("Refresh token not found or has been revoked");
    }

    // Check if token has expired
    if (storedToken.expires_at < new Date()) {
      throw new Error("Refresh token has expired");
    }
    console.log(storedToken.user);
    // Check if user still exists and is active
    if (!storedToken.user || (storedToken.user as any).status_id !== 1) {
      throw new Error("User not found or inactive");
    }

    // Extend Expiry: ต่ออายุ Refresh Token ไปอีก เพื่อให้ใช้ซ้ำได้
    // ถ้าไม่ต้องการต่ออายุ (อยากให้หมดตามเวลาเดิม) ให้ลบบรรทัดนี้ทิ้งครับ
    const newExpiresAt = new Date(Date.now() + getRefreshTokenExpiry());
    storedToken.expires_at = newExpiresAt;

    // อัปเดตข้อมูล Device/IP ล่าสุดที่เข้ามาเรียกใช้งาน
    // if (deviceInfo) storedToken.device_info = deviceInfo;
    // if (ipAddress) storedToken.ip_address = ipAddress;

    await storedToken.save();

    // B. Generate ONLY New Access Token
    // ถอดรหัส User เพื่อเอามาทำ Payload ใหม่
    const decryptedUser = decryptAndCleanUserData(storedToken.user);
    const payload = { id: decryptedUser.id, email: decryptedUser.email };

    const newAccessToken = signAccessToken(payload);

    return {
      accessToken: newAccessToken,
      refreshToken: storedToken.token,
      expiresAt: storedToken.expires_at,
      user: storedToken.user,
    };
  } catch (error) {
    console.error("RefreshToken Service Error:", error);
    throw error;
  }
};

export const revokeRefreshToken = async (refreshToken: string) => {
  const storedToken = await RefreshTokenModel.findOne({
    where: {
      token: refreshToken,
      is_revoked: false,
    },
  });

  if (storedToken) {
    storedToken.is_revoked = true;
    await storedToken.save();
  }
};

export const revokeAllUserTokens = async (userId: number) => {
  await RefreshTokenModel.update(
    { is_revoked: true },
    {
      where: {
        user_id: userId,
        is_revoked: false,
      },
    }
  );
};

export const cleanupExpiredTokens = async () => {
  await RefreshTokenModel.destroy({
    where: {
      expires_at: {
        [require("sequelize").Op.lt]: new Date(),
      },
    },
  });
};

export const getLatestRefreshTokenByUserId = async (userId: number) => {
  try {
    const token = await RefreshTokenModel.findOne({
      where: {
        user_id: userId,
        is_revoked: false,
      },
      order: [["id", "DESC"]],
      include: [
        {
          model: UserModel,
          as: "user",
          attributes: [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "status_id",
          ],
        },
      ],
    });

    if (!token) {
      throw new Error("No refresh token found for this user");
    }

    return token;
  } catch (error) {
    console.error("GetLatestRefreshTokenByUserId Service Error:", error);
    throw error;
  }
};
