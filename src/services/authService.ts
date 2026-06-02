import * as crypto from "crypto";
import bcrypt from "bcrypt";
import { signToken } from "../utils/jwt";
import { generateTokens } from "./refreshTokenService";
import axios from "axios";
import PipedaEncryptionService from "./pipedaEncryptionService";
import AuditService from "./auditService";
import PipedaUserDataHandler from "../middleware/pipedaUserDataHandler";
import {
  decryptAndCleanUserData,
  findUserByEmail,
  findUserByUsername,
  findUserByIdentifier,
  findUserByPhoneNumber,
  createEmailHash,
} from "../utils/encryptedFieldMapping";
import UserModel from "../models/UserModel";
import UserRoleModel from "../models/UserRolesModel";
import DepartmentModel from "../models/DepartmentModel";
import UserEmploymentModel from "../models/UserEmploymentsModel";
import RoleModel from "../models/RolesModel";
import FacilityModel from "../models/FacilitiesModel";
import DepartmentTypeModel from "../models/DepartmentTypesModel";
import FacilityTypeModel from "../models/FacilityTypesModel";
import GenderModel from "../models/GenderModel";
import UserStatusModel from "../models/UserStatusModel";
import DepartmentSupervisorModel from "../models/DepartmentSupervisorModel";
import { Op } from "sequelize";

// --- Helper Function to Generate HTML Content ---
const generateEmailHtml = (
  title: string,
  messageBody: string,
  actionText: string,
  otp: string,
  ref: string
) => {
  // Generate OTP boxes HTML
  const otpBoxes = otp
    .toString()
    .split("")
    .map(
      (digit) => `
    <span style="display: inline-block; width: 40px; height: 45px; line-height: 45px; background-color: #ecfeff; color: #0891b2; font-size: 24px; font-weight: bold; margin: 0 4px; border-radius: 6px; border: 1px solid #cffafe;">${digit}</span>
  `
    )
    .join("");

  return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }
          .container { max-width: 1200px; width: 100%; margin: 0 auto; padding: 40px 20px; }
          .logo { margin-bottom: 20px; }
          .card { background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb; }
          .card-header { background-color: #e5e7eb; padding: 15px 30px; font-weight: bold; color: #374151; font-size: 18px; border-bottom: 1px solid #d1d5db; }
          .card-body { padding: 40px 30px; }
          .greeting { font-size: 20px; font-weight: bold; color: #111827; margin-top: 0; }
          .text-content { color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px; }
          .otp-container { text-align: center; margin: 35px 0; }
          .expiry-text { color: #4b5563; font-size: 16px; margin-bottom: 5px; }
          .expiry-time { font-weight: bold; color: #1f2937; }
          .ignore-text { color: #9ca3af; font-size: 14px; margin-top: 5px; font-style: italic; }
          .ref-text { color: #9ca3af; font-size: 14px; margin-top: 5px; }
          .signature { margin-top: 40px; }
          .signature p { margin: 0; color: #4b5563; font-size: 16px; }
          .signature .team-name { color: #0ea5e9; font-weight: bold; margin-top: 5px; }
          .footer { text-align: center; margin-top: 40px; color: #9ca3af; font-size: 14px; }
          .social-icons { margin: 20px 0; }
          .social-icon { display: inline-block; margin: 0 10px; text-decoration: none; }
          .footer-links a { color: #9ca3af; text-decoration: none; margin: 0 5px; }
          .copyright { margin-top: 15px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
             <div style="font-weight: bold; font-size: 24px; color: #0ea5e9; display: flex; align-items: center;">
                <img src="https://cdn.mcauto-images-production.sendgrid.net/2e27603b1b273708/532fb83c-7d5e-4448-ae12-7be24137fdef/170x40.png" alt="MediAct Logo" width="170" height="40" style="display: block; border: 0;">
             </div>
          </div>
          
          <div class="card">
            <div class="card-header">
              ${title}
            </div>
            
            <div class="card-body">
              <p class="greeting">Hello,</p>
              
              <div class="text-content">
                ${messageBody}
                <br>
                Please enter this code to ${actionText}:
              </div>
              
              <div class="otp-container">
                ${otpBoxes}
              </div>
              
              <div style="margin-top: 20px;">
                <p class="expiry-text">OTP will expire in <span class="expiry-time">5 minutes.</span></p>
                <p class="ignore-text">If you didn't request this OTP, you can safely ignore this message.</p>
                <p class="ref-text">Reference No. : ${ref}</p>
              </div>
              
              <div class="signature">
                <p>Best Regards,</p>
                <p class="team-name">MediAct Team</p>
              </div>
            </div>
          </div>
          
          <div class="footer">
             <div style="font-weight: bold; font-size: 20px; color: #0ea5e9; margin-bottom: 15px; text-align: center;">
                <img src="https://cdn.mcauto-images-production.sendgrid.net/2e27603b1b273708/532fb83c-7d5e-4448-ae12-7be24137fdef/170x40.png" alt="MediAct Logo" width="170" height="40" style="display: block; border: 0; margin: 0 auto;">
             </div>
             
             <div class="social-icons">
               <a href="#" class="social-icon">
                 <img src="https://cdn.mcauto-images-production.sendgrid.net/2e27603b1b273708/f2788142-db93-4313-983e-37422fc71018/24x24.png" alt="LINE" width="24" height="24" style="vertical-align: middle;">
               </a>
               <a href="#" class="social-icon">
                 <img src="https://cdn.mcauto-images-production.sendgrid.net/2e27603b1b273708/669dfcec-173a-47f8-b0b0-a511a0ebb67a/24x24.png" alt="Facebook" width="24" height="24" style="vertical-align: middle;">
               </a>
               <a href="#" class="social-icon">
                 <img src="https://cdn.mcauto-images-production.sendgrid.net/2e27603b1b273708/49e4dd66-ac57-45e8-80f9-2130e93e9c5f/24x24.png" alt="TikTok" width="24" height="24" style="vertical-align: middle;">
               </a>
             </div>
             
             <div class="footer-links">
               <a href="https://mediact.biz">mediact.biz</a> | <a href="mailto:sales@mediact.biz">sales@mediact.biz</a>
             </div>
             
             <p class="copyright">© 2025 MediAct. All right reserved.</p>
          </div>
        </div>
      </body>
      </html>
  `;
};

// Temporary OTP storage (ในการใช้งานจริงควรใช้ Redis)
const temporaryOTPStorage = new Map<
  string,
  {
    otp: string;
    ref: string;
    expires: Date;
  }
>();

// Helper functions for temporary OTP storage
const storeTemporaryOTP = async (
  email: string,
  otp: string,
  ref: string,
  expires: Date
) => {
  const key = `${email}:${ref}`;
  temporaryOTPStorage.set(key, { otp, ref, expires });

  // Auto cleanup expired OTPs after 15 minutes
  setTimeout(() => {
    temporaryOTPStorage.delete(key);
  }, 15 * 60 * 1000);
};

const verifyTemporaryOTP = async (
  email: string,
  otp: string,
  ref: string
): Promise<boolean> => {
  const key = `${email}:${ref}`;
  const stored = temporaryOTPStorage.get(key);

  if (!stored) {
    return false;
  }

  if (stored.expires < new Date()) {
    temporaryOTPStorage.delete(key);
    return false;
  }

  return stored.otp === otp && stored.ref === ref;
};

const clearTemporaryOTP = async (email: string, ref: string) => {
  const key = `${email}:${ref}`;
  temporaryOTPStorage.delete(key);
};

export const registerUser = async (
  username: string,
  email: string,
  password: string,
  first_name: string,
  last_name: string,
  phone_number: string,
  gender_id: number,
  role_id: number
) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  // console.log("Registering user:1111");

  const existingUser = await findUserByEmail(email, UserModel);
  if (existingUser) {
    throw new Error("Email already in use");
  }

  const existingUsername = await findUserByUsername(username, UserModel);
  if (existingUsername) {
    throw new Error("Username already in use");
  }

  // เตรียมข้อมูลสำหรับ encryption
  const userData = {
    username,
    email,
    password: hashedPassword,
    first_name,
    last_name,
    phone_number,
    gender_id,
    status_id: 1,
    status: "active",
    // PIPEDA compliance tracking
    consent_given_date: new Date(),
    privacy_policy_version: "v1.0",
    data_retention_date: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000), // 7 years from now
  };

  // ใช้ handler เพื่อ encrypt ข้อมูลและลบ plain text
  const encryptedUserData =
    PipedaUserDataHandler.prepareEncryptedData(userData);

  // สร้าง user พร้อม PIPEDA encryption
  const user = await UserModel.create(encryptedUserData);

  // เพิ่มข้อมูลใน user_role
  await UserRoleModel.create({
    user_id: user.id,
    role_id: role_id,
    is_active: true,
    assigned_at: new Date(),
  });

  // Log PIPEDA compliance audit for new user registration
  await AuditService.log({
    userId: user.id,
    action: "USER_REGISTER_ENCRYPTED",
    tableName: "users",
    recordId: user.id,
    newValues: {
      action: "new_user_registration",
      encrypted_fields: ["email", "first_name", "last_name", "phone_number"],
      encryption_version: "v1.0",
      pipeda_compliant: true,
      consent_given: true,
      privacy_policy_version: "v1.0",
    },
  });

  console.log(
    `✅ New user registered with PIPEDA encryption: ${email} (ID: ${user.id})`
  );

  // console.log("Registering user:2222");

  return user;
};

export const registerUserV2 = async (
  role_id: number,
  email: string,
  password: string,
  phone_number: string,
  is_verified_email: boolean = true
) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log("Registering user V2 with email:", email);

  // Check if email already exists
  const existingUser = await findUserByEmail(email, UserModel);
  if (existingUser) {
    throw new Error("Email already in use");
  }

  // Generate username from email (before @ symbol) and ensure uniqueness
  let username = email.split("@")[0];
  let usernameExists = await findUserByUsername(username, UserModel);
  let counter = 1;

  while (usernameExists) {
    username = `${email.split("@")[0]}${counter}`;
    usernameExists = await findUserByUsername(username, UserModel);
    counter++;
  }

  // เตรียมข้อมูลสำหรับ encryption - minimal data for mobile registration
  const userData = {
    username,
    role_id,
    email,
    password: hashedPassword,
    first_name: "", // Will be updated later when user completes profile
    last_name: "", // Will be updated later when user completes profile
    phone_number,
    gender_id: null, // Will be set later when user completes profile
    status_id: 1,
    status: "active",
    is_verified_email, // Set based on mobile app verification
    // PIPEDA compliance tracking
    consent_given_date: new Date(),
    privacy_policy_version: "v1.0",
    data_retention_date: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000), // 7 years from now
  };

  // ใช้ handler เพื่อ encrypt ข้อมูลและลบ plain text
  const encryptedUserData =
    PipedaUserDataHandler.prepareEncryptedData(userData);

  // สร้าง user พร้อม PIPEDA encryption
  const user = await UserModel.create(encryptedUserData);

  // เพิ่มข้อมูลใน user_role - default role for mobile users (role_id: 2 for regular users)
  await UserRoleModel.create({
    user_id: user.id,
    role_id: role_id ?? 2, // Default role for mobile app users
    is_active: true,
    assigned_at: new Date(),
  });

  // Log PIPEDA compliance audit for new user registration
  await AuditService.log({
    userId: user.id,
    action: "USER_REGISTER_V2_ENCRYPTED",
    tableName: "users",
    recordId: user.id,
    newValues: {
      action: "mobile_user_registration",
      encrypted_fields: ["email", "phone_number"],
      encryption_version: "v1.0",
      pipeda_compliant: true,
      consent_given: true,
      privacy_policy_version: "v1.0",
      is_verified_email,
    },
  });

  console.log(
    `✅ New mobile user registered with PIPEDA encryption: ${email} (ID: ${user.id})`
  );

  return user;
};

export const loginUser = async (email: string, password: string) => {
  const emailHash = createEmailHash(email);
  const user = await UserModel.findOne({
    where: { email_hash: emailHash, status_id: 1 },
    include: [
      {
        model: UserRoleModel,
        as: "user_role",
        where: { is_active: true },
        required: false,
        attributes: ["assigned_at"],
        include: [
          {
            model: RoleModel,
            as: "role",
            attributes: ["name"],
          },
        ],
      },
      {
        model: UserEmploymentModel,
        as: "user_employment",
        attributes: ["position_id", "start_date"],
        where: { is_active: true },
        required: false,
        include: [
          {
            model: DepartmentModel,
            as: "department",
            attributes: ["name"],
            // include: [
            //   {
            //     model: DepartmentTypeModel,
            //     as: "department_type",
            //     attributes: ["name"],
            //   },
            // ],
          },
          {
            model: FacilityModel,
            as: "facility",
            attributes: ["id", "name", "address", "latitude", "longitude"],
            // include: [
            //   {
            //     model: FacilityTypeModel,
            //     as: "facility_type",
            //     attributes: ["name"],
            //   },
            // ],
          },
        ],
      },
      {
        model: GenderModel,
        as: "user_gender",
        attributes: ["name"],
        required: false,
      },
      {
        model: UserStatusModel,
        as: "user_status",
        attributes: ["name"],
        required: false,
      },
    ],
  });
  // console.log(user);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const token = signToken({ id: user.id, email: user.email });

  // Generate refresh token
  const tokens = await generateTokens(user);

  // Decrypt user data for response using clean utility function
  const decryptedUser = decryptAndCleanUserData(user);

  return {
    token,
    refreshToken: tokens.refreshToken,
    expiresAt: tokens.expiresAt,
    user: {
      id: decryptedUser.id,
      username: decryptedUser.username,

      email: decryptedUser.email,
      first_name: decryptedUser.first_name,
      last_name: decryptedUser.last_name,
      country_code: decryptedUser.country_code,
      phone_number: decryptedUser.phone_number,
      profile_picture: decryptedUser.profile_picture,
      date_of_birth: decryptedUser.date_of_birth,
      last_password_change: decryptedUser.last_password_change,
      signup_date: decryptedUser.created_at,
      gender: decryptedUser.user_gender?.name || null,
      status: decryptedUser.user_status?.name || null,
      user_role: decryptedUser.user_role,
      user_employment: user.user_employment,
    },
  };
};

export const loginUserV2 = async (identifier: string, password: string) => {
  // ใช้ findUserByIdentifier ที่จะจัดการ encrypted fields โดยอัตโนมัติ
  const user = await findUserByIdentifier(identifier, UserModel, {
    where: { status_id: 1 },
    include: [
      {
        model: UserRoleModel,
        as: "user_role",
        where: { is_active: true },
        required: false,
        attributes: ["assigned_at"],
        include: [
          {
            model: RoleModel,
            as: "role",
            attributes: ["name"],
          },
        ],
      },
      {
        model: UserEmploymentModel,
        as: "user_employment",
        attributes: ["position_id", "start_date"],
        where: { is_active: true },
        required: false,
        include: [
          {
            model: DepartmentModel,
            as: "department",
            attributes: ["id", "name"],
            // include: [
            //   {
            //     model: DepartmentTypeModel,
            //     as: "department_type",
            //     attributes: ["name"],
            //   },
            // ],
          },
          {
            model: FacilityModel,
            as: "facility",
            attributes: ["id", "name", "address", "latitude", "longitude"],
            // include: [
            //   {
            //     model: FacilityTypeModel,
            //     as: "facility_type",
            //     attributes: ["name"],
            //   },
            // ],
          },
        ],
      },
      {
        model: GenderModel,
        as: "user_gender",
        attributes: ["name"],
        required: false,
      },
      {
        model: UserStatusModel,
        as: "user_status",
        attributes: ["name"],
        required: false,
      },
    ],
  });

  // console.log(user);

  if (!user) {
    throw new Error("Invalid email/username or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email/username or password");
  }

  const token = signToken({ id: user.id, email: user.email });

  // Generate refresh token
  const tokens = await generateTokens(user);

  // Decrypt user data for response using clean utility function
  const decryptedUser = decryptAndCleanUserData(user);

  return {
    token,
    refreshToken: tokens.refreshToken,
    expiresAt: tokens.expiresAt,
    user: {
      id: decryptedUser.id,
      username: decryptedUser.username,
      need_password_reset: decryptedUser.need_password_reset,
      email: decryptedUser.email,
      first_name: decryptedUser.first_name,
      last_name: decryptedUser.last_name,
      country_code: decryptedUser.country_code,
      phone_number: decryptedUser.phone_number,
      profile_picture: decryptedUser.profile_picture,
      date_of_birth: decryptedUser.date_of_birth,
      last_password_change: decryptedUser.last_password_change,
      signup_date: decryptedUser.created_at,
      gender: decryptedUser.user_gender?.name || null,
      status: decryptedUser.user_status?.name || null,
      user_role: decryptedUser.user_role,
      user_employment: user.user_employment,
    },
  };
};

export const backEndLoginUser = async (
  identifier: string,
  password: string
) => {
  console.log("🔍 backEndLoginUser called with identifier:", identifier);

  // ใช้ findUserByIdentifier ที่จะจัดการ encrypted fields โดยอัตโนมัติ
  const user = await findUserByIdentifier(identifier, UserModel, {
    where: { status_id: 1 },
    include: [
      {
        model: UserRoleModel,
        as: "user_role",
        where: { is_active: true },
        required: false,
        attributes: ["assigned_at"],
        include: [
          {
            model: RoleModel,
            as: "role",
            attributes: ["id", "name"],
          },
        ],
      },
      {
        model: UserEmploymentModel,
        as: "user_employment",
        attributes: ["position_id", "start_date"],
        where: { is_active: true },
        required: false,
        include: [
          {
            model: DepartmentModel,
            as: "department",
            attributes: ["name"],
          },
          {
            model: FacilityModel,
            as: "facility",
            attributes: ["id", "name", "address", "latitude", "longitude"],
          },
        ],
      },
      {
        model: GenderModel,
        as: "user_gender",
        attributes: ["name"],
        required: false,
      },
      {
        model: UserStatusModel,
        as: "user_status",
        attributes: ["name"],
        required: false,
      },
    ],
  });

  console.log(
    "👤 Found user:",
    user
      ? `ID: ${user.id}, username: ${user.username}, email: ${user.email}`
      : "null"
  );

  if (!user) {
    throw new Error("Invalid email or password 1");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password 2");
  }

  // Check if user has required role (1 or 28) for backend access
  const userRoles = Array.isArray(user.user_role)
    ? user.user_role
    : [user.user_role];

  console.log(
    "🔐 User roles:",
    userRoles?.map((ur: any) => ({ id: ur?.role?.id, name: ur?.role?.name }))
  );

  const hasRequiredRole = userRoles.some((userRole: any) => {
    const roleId = userRole?.role?.id;
    return (
      roleId === 1 ||
      roleId === 28 ||
      roleId === 32 ||
      roleId === 33 ||
      roleId === 34
    );
  });

  console.log("✅ Has required role (1 or 28):", hasRequiredRole);

  // If user doesn't have required role, check if they are a department supervisor
  let hasAccess = hasRequiredRole;
  if (!hasRequiredRole) {
    const supervisor = await DepartmentSupervisorModel.findOne({
      where: {
        user_id: user.id,
        is_active: true,
      },
    });
    hasAccess = !!supervisor;
    console.log("👮 Is department supervisor:", hasAccess);
  }

  if (!hasAccess) {
    throw new Error(
      "Access denied: Insufficient permissions for backend access"
    );
  }

  const token = signToken({ id: user.id, email: user.email });

  // Generate refresh token
  const tokens = await generateTokens(user);

  // Decrypt user data for response using clean utility function
  const decryptedUser = decryptAndCleanUserData(user);

  console.log("✅ Login successful for user ID:", user.id);

  return {
    token,
    refreshToken: tokens.refreshToken,
    expiresAt: tokens.expiresAt,
    user: {
      id: decryptedUser.id,
      username: decryptedUser.username,
      email: decryptedUser.email,
      first_name: decryptedUser.first_name,
      last_name: decryptedUser.last_name,
      country_code: decryptedUser.country_code,
      phone_number: decryptedUser.phone_number,
      profile_picture: decryptedUser.profile_picture,
      date_of_birth: decryptedUser.date_of_birth,
      last_password_change: decryptedUser.last_password_change,
      signup_date: decryptedUser.created_at,
      gender: decryptedUser.user_gender?.name || null,
      status: decryptedUser.user_status?.name || null,
      need_password_reset: decryptedUser.need_password_reset,
      user_role: decryptedUser.user_role,
      user_employment: user.user_employment,
    },
  };
};

const generateRef = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let ref = "";
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
};

export const requestPasswordReset = async (email: string) => {
  const user = await findUserByEmail(email, UserModel);
  console.log(user);

  if (!user) {
    throw new Error("Email not found");
  }

  // Generate OTP and ref
  const otp = crypto.randomInt(100000, 999999).toString();
  const ref = generateRef();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

  user.reset_password_token = otp;
  user.reset_password_ref = ref;
  user.reset_password_expires = otpExpires;
  await user.save();

  // Send email with OTP using ThaiBulkSMS
  const subject = "Your reset password OTP Code";
  const title = "Password Reset";
  const messageBody =
    "We received a request to reset the password for your MediAct account.";
  const actionText = "reset your password";

  const htmlContent = generateEmailHtml(
    title,
    messageBody,
    actionText,
    otp,
    ref
  );

  // Send email with OTP using ThaiBulkSMS
  const url = "https://email-api.thaibulksms.com/email/v1/send_template";
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization:
        "Basic " +
        Buffer.from(
          `${process.env.THAIBULKSMS_API_KEY}:${process.env.THAIBULKSMS_SECRET}`
        ).toString("base64"),
    },
    data: {
      mail_from: { email: "developer@mediact.biz", name: "MediAct" },
      mail_to: { email: email },
      subject: subject,
      template_uuid: "25120309-1819-8bca-858f-054e2f1adb98",
      payload: {
        content: htmlContent,
      },
    },
  };

  try {
    const response = await axios(url, options);
    console.log("✅ ThaiBulkSMS Response:", response.data);
  } catch (error: any) {
    console.error("❌ Failed to send OTP email via ThaiBulkSMS:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    throw new Error("Failed to send OTP email");
  }

  return { message: "OTP has been sent to your email", ref };
};

export const verifyOtp = async (email: string, otp: string, ref: string) => {
  const user = await findUserByEmail(email, UserModel);

  if (!user) {
    throw new Error("Email not found");
  }

  if (
    user.reset_password_token !== otp ||
    user.reset_password_ref !== ref ||
    !user.reset_password_expires ||
    user.reset_password_expires < new Date()
  ) {
    throw new Error("Invalid or expired OTP");
  }

  // OTP is valid
  user.reset_password_token = null;
  user.reset_password_ref = null;
  user.reset_password_expires = null;
  await user.save();

  return { message: "OTP verified successfully" };
};

export const resendOtp = async (email: string) => {
  const user = await findUserByEmail(email, UserModel);

  if (!user) {
    throw new Error("Email not found");
  }

  // Generate new OTP and ref
  const otp = crypto.randomInt(100000, 999999).toString();
  const ref = generateRef();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

  user.reset_password_token = otp;
  user.reset_password_ref = ref;
  user.reset_password_expires = otpExpires;
  await user.save();

  // Send email with OTP using ThaiBulkSMS
  const url = "https://email-api.thaibulksms.com/email/v1/send_template";
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization:
        "Basic " +
        Buffer.from(
          `${process.env.THAIBULKSMS_API_KEY}:${process.env.THAIBULKSMS_SECRET}`
        ).toString("base64"),
    },
    data: {
      mail_from: { email: "developer@mediact.biz", name: "MediAct" },
      mail_to: { email: email },
      subject: "Your reset password OTP Code",
      template_uuid: "25032322-3928-8ccd-b288-c6d856b55d00",
      payload: {
        OTP_CODE: otp,
        OTP_REF: ref,
        YEAR: "2025",
      },
    },
  };

  try {
    const response = await axios(url, options);
    console.log(response.data);
  } catch (error) {
    console.error("Failed to send OTP email", error);
    throw new Error("Failed to send OTP email");
  }

  return { message: "OTP has been sent to your email", ref };
};

export const resetPassword = async (email: string, newPassword: string) => {
  const user = await findUserByEmail(email, UserModel);

  if (!user) {
    throw new Error("Email not found");
  }

  // Hash new password and update
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.reset_password_token = null; // Clear the token
  user.reset_password_ref = null;
  user.reset_password_expires = null;

  await user.save();

  return { message: "Password has been reset successfully" };
};

export const resetPasswordNeed = async (
  userId: number,
  newPassword: string
) => {
  const user = await UserModel.findOne({ where: { id: userId } });

  if (!user) {
    throw new Error("User not found");
  }

  // Hash new password and update
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.reset_password_token = null; // Clear the token
  user.reset_password_ref = null;
  user.reset_password_expires = null;
  user.need_password_reset = false; // Set
  await user.save();

  return { message: "Password has been reset successfully" };
};

// send OTP Email
export const requestEmailVerification = async (email: string) => {
  const user = await findUserByEmail(email, UserModel);

  if (!user) {
    throw new Error("Email not found");
  }

  if (user.is_verified_email) {
    return {
      message: "อีเมลนี้เคยได้รับการยืนยันแล้ว",
      already_verified: true,
    };
  }

  // Generate OTP and ref
  const otp = crypto.randomInt(100000, 999999).toString();
  const ref = generateRef();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.verification_token = otp;
  user.verification_ref = ref;
  user.verification_expires = otpExpires;
  await user.save();

  // Send email with OTP
  // Prepare Email Content
  // Title: Email Verification
  // Body: Here is your One Time Password (OTP).
  // Action: verify your email address
  const subject = "Email Verification OTP";
  const title = "Email Verification";
  const messageBody = "Here is your One Time Password (OTP).";
  const actionText = "verify your email address";

  const htmlContent = generateEmailHtml(
    title,
    messageBody,
    actionText,
    otp,
    ref
  );

  // Send email with OTP via ThaiBulkSMS
  const url = "https://email-api.thaibulksms.com/email/v1/send_template";
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization:
        "Basic " +
        Buffer.from(
          `${process.env.THAIBULKSMS_API_KEY}:${process.env.THAIBULKSMS_SECRET}`
        ).toString("base64"),
    },
    data: {
      mail_from: { email: "developer@mediact.biz", name: "MediAct" },
      mail_to: { email: email },
      subject: subject,
      template_uuid: "25120309-1819-8bca-858f-054e2f1adb98",
      payload: {
        content: htmlContent,
      },
    },
  };

  try {
    const response = await axios(url, options);
    console.log(response.data);
  } catch (error) {
    console.error("Failed to send email verification OTP", error);
    throw new Error("Failed to send email verification OTP");
  }
  return { message: "Email verification OTP has been sent", ref };
};

// send SMS OTP Phone
export const requestPhoneVerification = async (phone_number: string) => {
  let refResult = "";

  const user = await findUserByPhoneNumber(phone_number, UserModel);
  if (!user) {
    throw new Error(`Phone number not found: ${phone_number}`);
  }
  if (user.is_verified_phone) {
    return {
      message: "หมายเลขโทรศัพท์นี้เคยได้รับการยืนยันแล้ว",
      already_verified: true,
    };
  }
  // Generate OTP and ref
  const otp = crypto.randomInt(100000, 999999).toString();
  const ref = generateRef();
  refResult = ref; // เก็บ ref ล่าสุด
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  user.verification_token = otp;
  user.verification_ref = ref;
  user.verification_expires = otpExpires;
  await user.save();
  // Prepare SMS message
  const message = `${otp} is your OTP for phone number verification (Ref No. ${ref}) It’s valid for 10 minutes. Please do not share this code.`;
  // Send SMS
  const smsApiKey =
    process.env.THAIBULKSMS_SMS_API_KEY || process.env.THAIBULKSMS_API_KEY;
  const smsApiSecret =
    process.env.THAIBULKSMS_SMS_SECRET || process.env.THAIBULKSMS_SECRET;

  if (!smsApiKey || !smsApiSecret) {
    console.error("❌ Critical Error: Missing ThaiBulkSMS API Keys in .env");
    throw new Error("Server configuration error: Missing SMS API Keys");
  }

  const encodedParams = new URLSearchParams();
  encodedParams.set("msisdn", phone_number);
  encodedParams.set("message", message);
  encodedParams.set("sender", "MediAct");
  encodedParams.set("force", "corporate");
  encodedParams.set("shorten_url", "false");
  encodedParams.set("expire", "00:10");

  const url = "https://api-v2.thaibulksms.com/sms";

  // ใช้ Key ที่ดึงมาอย่างถูกต้อง
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded",
      authorization:
        "Basic " +
        Buffer.from(`${smsApiKey}:${smsApiSecret}`).toString("base64"),
    },
    data: encodedParams,
  };

  try {
    const response = await axios(url, options);
    console.log("✅ SMS Sent via ThaiBulkSMS:", response.data);
  } catch (error: any) {
    console.error(
      "Failed to send phone verification OTP:",
      error.response?.data || error.message
    );
    throw new Error("Failed to send phone verification OTP");
  }

  // user.is_verified_phone = true;
  // user.verified_phone_date = new Date();
  // await user.save();

  return { message: "Phone verification OTP has been sent", ref: refResult };
};

// verify Email
export const verifyOtpEmail = async (
  email: string,
  otp: string,
  ref: string
) => {
  const user = await findUserByEmail(email, UserModel);

  if (!user) {
    throw new Error("Email not found");
  }

  if (
    user.verification_token !== otp ||
    user.verification_ref !== ref ||
    !user.verification_expires ||
    user.verification_expires < new Date()
  ) {
    throw new Error("Invalid or expired OTP");
  }

  // OTP is valid - mark email as verified (ไม่เคลียร์ reset password tokens)
  user.is_verified_email = true;
  user.verified_email_date = new Date();
  await user.save();

  return { message: "Email verified successfully" };
};

// verify Phone Number
export const verifyOtpPhoneNumber = async (
  phone_number: string,
  otp: string,
  ref: string
) => {
  const user = await findUserByPhoneNumber(phone_number, UserModel);

  if (!user) {
    throw new Error("Phone number not found");
  }

  if (
    user.verification_token !== otp ||
    user.verification_ref !== ref ||
    !user.verification_expires ||
    user.verification_expires < new Date()
  ) {
    throw new Error("Invalid or expired OTP");
  }

  // OTP is valid - mark phone as verified (ไม่เคลียร์ reset password tokens)
  user.is_verified_phone = true;
  user.verified_phone_date = new Date();
  await user.save();

  return { message: "Phone number verified successfully" };
};

// --- Mobile ReDesign ---

// send OTP Email for register
export const requestEmailVerificationRegister = async (email: string) => {
  // Check if email already exists
  const existingUser = await findUserByEmail(email, UserModel);
  if (existingUser) {
    throw new Error("Email is already registered");
  }

  // Generate OTP and ref (store temporarily, not in user table)
  const otp = crypto.randomInt(100000, 999999).toString();
  const ref = generateRef();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store OTP in temporary storage (Redis, cache, or temp table)
  await storeTemporaryOTP(email, otp, ref, otpExpires);

  // Send email with OTP
  // Prepare Email Content
  // Title: Account Registration
  // Body: Thank you for signing up with MediAct!
  // Action: confirm your email address
  const subject = "Email Verification OTP for Registration";
  const title = "Account Registration";
  const messageBody = "Thank you for signing up with MediAct!";
  const actionText = "confirm your email address";

  const htmlContent = generateEmailHtml(
    title,
    messageBody,
    actionText,
    otp,
    ref
  );

  // Send email with OTP via ThaiBulkSMS
  const url = "https://email-api.thaibulksms.com/email/v1/send_template";
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization:
        "Basic " +
        Buffer.from(
          `${process.env.THAIBULKSMS_API_KEY}:${process.env.THAIBULKSMS_SECRET}`
        ).toString("base64"),
    },
    data: {
      mail_from: { email: "developer@mediact.biz", name: "MediAct" },
      mail_to: { email: email },
      subject: subject,
      template_uuid: "25120309-1819-8bca-858f-054e2f1adb98",
      payload: {
        content: htmlContent,
      },
    },
  };

  try {
    const response = await axios(url, options);
    console.log(response.data);
  } catch (error) {
    console.error("Failed to send email verification OTP", error);
    throw new Error("Failed to send email verification OTP");
  }
  return { message: "Email verification OTP has been sent", ref };
};

export const verifyOtpEmailRegister = async (
  email: string,
  otp: string,
  ref: string
) => {
  // Verify OTP from temporary storage
  const isValid = await verifyTemporaryOTP(email, otp, ref);

  if (!isValid) {
    throw new Error("Invalid or expired OTP");
  }

  // Clear temporary OTP
  await clearTemporaryOTP(email, ref);

  // user.is_verified_email = true;
  // user.verified_email_date = new Date();
  // await user.save();

  return { message: "Email verified successfully for registration" };
};

export const resendOtpRegister = async (email: string) => {
  // Check if email already exists (same logic as requestEmailVerificationRegister)
  const existingUser = await findUserByEmail(email, UserModel);
  if (existingUser) {
    throw new Error("Email is already registered");
  }

  // Generate new OTP and ref for temporary storage
  const otp = crypto.randomInt(100000, 999999).toString();
  const ref = generateRef();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

  // Store OTP in temporary storage (same as requestEmailVerificationRegister)
  await storeTemporaryOTP(email, otp, ref, otpExpires);

  // Send email with OTP using ThaiBulkSMS
  const subject = "Email Verification OTP for Registration";
  const title = "Account Registration";
  const messageBody = "Thank you for signing up with MediAct!";
  const actionText = "confirm your email address";

  const htmlContent = generateEmailHtml(
    title,
    messageBody,
    actionText,
    otp,
    ref
  );
  // Send email with OTP using ThaiBulkSMS
  const url = "https://email-api.thaibulksms.com/email/v1/send_template";
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization:
        "Basic " +
        Buffer.from(
          `${process.env.THAIBULKSMS_API_KEY}:${process.env.THAIBULKSMS_SECRET}`
        ).toString("base64"),
    },
    data: {
      mail_from: { email: "developer@mediact.biz", name: "MediAct" },
      mail_to: { email: email },
      subject: subject,
      template_uuid: "25120309-1819-8bca-858f-054e2f1adb98",
      payload: {
        content: htmlContent,
      },
    },
  };

  try {
    const response = await axios(url, options);
    console.log(response.data);
  } catch (error) {
    console.error("Failed to resend email verification OTP", error);
    throw new Error("Failed to resend email verification OTP");
  }

  return { message: "Email verification OTP has been resent", ref };
};
