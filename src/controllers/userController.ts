import { Context } from "koa";
import * as UserService from "../services/userService";
import * as UserRoleService from "../services/userRoleService";
import {
  createUserSchema,
  editUserSchema,
} from "../validations/userValidation";
import Joi from "joi/lib";
import PipedaEncryptionService from "../services/pipedaEncryptionService";
import AuditService from "../services/auditService";
import PipedaUserDataHandler from "../middleware/pipedaUserDataHandler";
import * as fs from "fs/promises";
import { importUsers } from "../services/userService";

export const createUser = async (ctx: Context) => {
  const { error, value } = createUserSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }
  console.log("createUser called");
  console.log("Request body:", ctx.request.body);

  // Extract role_tags and group_tags from value
  const { role_id, group_tags, ...userData } = value;
  const createdBy = ctx.state.user?.id;

  try {
    // Pass createdBy to your service/model
    const user = await UserService.createUser(
      {
        ...userData,
        created_by: createdBy,
        updated_by: createdBy,
        // group_tags, // เพิ่ม group_tags เข้าไปใน userData
      },
      group_tags
    );
    // Insert user_roles if role_id is provided and is greater than 0
    if (role_id && role_id > 0) {
      await UserRoleService.assignRoleToUser({
        user_id: user.id,
        role_id: role_id,
        is_active: true,
        assigned_at: new Date(),
      });
    }
    ctx.status = 201;
    ctx.body = {
      message: "User created successfully",
      user: PipedaUserDataHandler.decryptUserData(user),
    };
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

export const updateUser = async (ctx: Context) => {
  const { id } = ctx.params;
  const { error, value } = editUserSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  // Extract role_tags and group_tags from value
  const { role_tags, group_tags, ...userData } = value;
  const updatedBy = ctx.state.user?.id;

  try {
    const updatedUser = await UserService.updateUser(parseInt(id, 10), {
      ...userData,
      group_tags, // เพิ่ม group_tags เข้าไปใน userData
      updated_by: updatedBy,
    });
    // Update user_roles if role_tags is provided and is an array
    if (Array.isArray(role_tags)) {
      // Remove all existing roles for this user using service
      await UserRoleService.deleteAllRolesForUser(parseInt(id, 10));
      // Assign new roles
      await Promise.all(
        role_tags.map((roleId: number) =>
          UserRoleService.assignRoleToUser({
            user_id: parseInt(id, 10),
            role_id: roleId,
            is_active: true,
            assigned_at: new Date(),
          })
        )
      );
    }
    ctx.body = {
      message: "User updated successfully",
      updatedUser: PipedaUserDataHandler.decryptUserData(updatedUser),
    };
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

export const updateUserMobile = async (ctx: Context) => {
  console.log("updateUserMobile called");
  console.log("Request body:", ctx.request.body);
  const userId = ctx.state.user.id;

  // Extract the allowed fields for mobile update including new fields
  const allowedFields = [
    "role_id",
    "first_name",
    "last_name",
    "nickname",
    "email",
    "username",
    "phone_number",
    "country_code",
    "date_of_birth",
    "profile_picture",
    "id_card_number",
    "gender_id",
    "ID_line",
    "occupation_number",
    "occupation_expired",
    "occupation_document_url",
    "occupation_passed_unit",
    "created_at",
    "updated_at",
  ];

  console.log("Allowed fields:", allowedFields);

  // Filter request body to only include allowed fields
  const updateData: any = {};
  const sensitiveFieldsUpdated: string[] = [];

  Object.keys(ctx.request.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      updateData[key] = ctx.request.body[key];

      // Track sensitive fields for PIPEDA compliance
      if (
        [
          "email",
          "first_name",
          "last_name",
          "phone_number",
          "id_card_number",
          "ID_line",
        ].includes(key)
      ) {
        sensitiveFieldsUpdated.push(key);
      }
    }
  });

  // Add updated_by field
  updateData.updated_by = userId;

  try {
    const updatedUser = await UserService.updateUserMobile(userId, updateData);

    // Log sensitive data updates สำหรับ PIPEDA compliance
    if (sensitiveFieldsUpdated.length > 0) {
      await AuditService.log({
        userId: userId,
        action: "SENSITIVE_UPDATE",
        tableName: "users",
        recordId: userId,
        newValues: {
          sensitive_fields_updated: sensitiveFieldsUpdated,
          reason: "User mobile profile update",
          ip_address: ctx.request.ip,
          masked_data: sensitiveFieldsUpdated.reduce((acc, field) => {
            acc[field] = PipedaEncryptionService.createMaskedVersion(
              updateData[field],
              2
            );
            return acc;
          }, {} as any),
        },
      });
    }

    ctx.body = {
      message: "User updated successfully",
      updatedUser: PipedaUserDataHandler.decryptUserData(updatedUser),
    };
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

export const deleteUser = async (ctx: Context) => {
  try {
    const { id } = ctx.params;

    console.log(
      "Admin (ID:",
      ctx.state.user.id,
      ") is deleting user with ID:",
      id
    );

    await UserService.updateUserStatus(Number(id)); // Update status to 'inactive'

    ctx.body = { message: "Account deactivated successfully" };
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

export const getUserById = async (ctx: Context) => {
  const { id } = ctx.params;
  const requestingUserId = ctx.state.user?.id;

  try {
    const user = await UserService.getUserById(parseInt(id, 10));

    // Log การเข้าถึงข้อมูล sensitive สำหรับ PIPEDA compliance
    if (requestingUserId) {
      await AuditService.log({
        userId: requestingUserId,
        action: "SENSITIVE_VIEW",
        tableName: "users",
        recordId: parseInt(id, 10),
        newValues: {
          sensitive_fields_accessed: [
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "id_card_number",
          ],
          reason: "User profile view by ID",
          ip_address: ctx.request.ip,
        },
      });
    }

    // ส่งข้อมูลที่ปลอดภัยสำหรับ PIPEDA compliance
    ctx.body = { user: PipedaUserDataHandler.decryptUserData(user) };
  } catch (error) {
    ctx.status = 404;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const getUserInfo = async (ctx: Context) => {
  const userId = ctx.state.user.id;

  try {
    const user = await UserService.getUserInfo(userId);

    // Log การเข้าถึงข้อมูลตนเองสำหรับ PIPEDA compliance
    await AuditService.log({
      userId: userId,
      action: "SENSITIVE_SELF_VIEW",
      tableName: "users",
      recordId: userId,
      newValues: {
        sensitive_fields_accessed: [
          "email",
          "first_name",
          "last_name",
          "phone_number",
        ],
        reason: "User viewing own profile information",
        ip_address: ctx.request.ip,
      },
    });

    ctx.body = { user: PipedaUserDataHandler.decryptUserData(user) };
  } catch (error) {
    ctx.status = 404;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const getUserByFacility = async (ctx: Context) => {
  const userId = ctx.state.user.id;

  try {
    const users = await UserService.getUserByFacility(parseInt(userId, 10));
    ctx.body = { users: PipedaUserDataHandler.decryptUsersData(users) };
  } catch (error) {
    ctx.status = 404;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const getAllUsers = async (ctx: Context) => {
  try {
    const page = parseInt(ctx.query.page as string, 10) || 1;
    const pageSize = parseInt(ctx.query.pageSize as string, 10) || 20;
    const searchQuery = ctx.query.search as string | undefined;
    const startDate = ctx.query.startDate as string | undefined;
    const endDate = ctx.query.endDate as string | undefined;

    const facilityId = ctx.query.facility_id
      ? parseInt(ctx.query.facility_id as string, 10)
      : undefined;
    const departmentId = ctx.query.department_id
      ? parseInt(ctx.query.department_id as string, 10)
      : undefined;

    const requestingUserId = ctx.state.user?.id;

    const { users, total } = await UserService.getAllUsers(
      requestingUserId,
      page,
      pageSize,
      searchQuery,
      startDate,
      endDate,
      facilityId,
      departmentId
    ); // Log การเข้าถึงข้อมูลผู้ใช้ทั้งหมดสำหรับ PIPEDA compliance

    if (requestingUserId) {
      await AuditService.log({
        userId: requestingUserId,
        action: "SENSITIVE_BULK_VIEW",
        tableName: "users",
        newValues: {
          reason: "Viewing all users list",
          users_count: users.length,
          ip_address: ctx.request.ip,
          // 🔥 เพิ่ม log filter
          filters_applied: {
            search: searchQuery,
            facility: facilityId,
            department: departmentId,
          },
        },
      });
    }

    ctx.body = {
      users: PipedaUserDataHandler.decryptUsersData(users),
      pagination: {
        total: total,
        page: page,
        pageSize: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
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

/**
 * PIPEDA Compliance - ลบข้อมูลส่วนบุคคล (Right to be forgotten)
 */
export const erasePiiData = async (ctx: Context) => {
  const { id } = ctx.params;
  const requestingUserId = ctx.state.user?.id;

  try {
    const user = await UserService.getUserById(parseInt(id, 10));

    if (!user) {
      ctx.status = 404;
      ctx.body = { error: "User not found" };
      return;
    }

    // Log การลบข้อมูล PII
    await AuditService.log({
      userId: requestingUserId,
      action: "PIPEDA_ERASE_PII",
      tableName: "users",
      recordId: parseInt(id, 10),
      newValues: {
        reason: "PIPEDA Right to be forgotten - PII data erasure",
        erased_fields: [
          "email",
          "first_name",
          "last_name",
          "phone_number",
          "id_card_number",
          "passport_number",
        ],
        ip_address: ctx.request.ip,
      },
    });

    // ลบข้อมูล PII (ใช้ updateUser แทน)
    const erasedUser = await UserService.updateUser(parseInt(id, 10), {
      email: null,
      first_name: "DELETED",
      last_name: "DELETED",
      phone_number: null,
      id_card_number: null,
      passport_number: null,
      ID_line: null,
      updated_by: requestingUserId,
    });

    ctx.body = {
      message: "PII data erased successfully per PIPEDA compliance",
      user: erasedUser,
    };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

/**
 * PIPEDA Compliance - บันทึกการยินยอม
 */
export const recordConsent = async (ctx: Context) => {
  const userId = ctx.state.user.id;

  try {
    await AuditService.log({
      userId: userId,
      action: "PIPEDA_CONSENT_GIVEN",
      tableName: "users",
      recordId: userId,
      newValues: {
        reason: "User gave consent for personal data processing",
        consent_date: new Date().toISOString(),
        ip_address: ctx.request.ip,
      },
    });

    // อัปเดต consent date (ใช้ updateUser แทน)
    const updatedUser = await UserService.updateUser(userId, {
      updated_by: userId,
    });

    ctx.body = {
      message: "Consent recorded successfully",
      consent_date: new Date().toISOString(),
    };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

/**
 * PIPEDA Compliance - ถอนการยินยอม
 */
export const withdrawConsent = async (ctx: Context) => {
  const userId = ctx.state.user.id;

  try {
    await AuditService.log({
      userId: userId,
      action: "PIPEDA_CONSENT_WITHDRAWN",
      tableName: "users",
      recordId: userId,
      newValues: {
        reason: "User withdrew consent for personal data processing",
        withdrawal_date: new Date().toISOString(),
        ip_address: ctx.request.ip,
      },
    });

    // อัปเดต consent withdrawal date (ใช้ updateUser แทน)
    const updatedUser = await UserService.updateUser(userId, {
      updated_by: userId,
    });

    ctx.body = {
      message: "Consent withdrawn successfully",
      withdrawal_date: new Date().toISOString(),
    };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const importUsersController = async (ctx: Context) => {
  const files = ctx.request.files;
  const userId = ctx.state.user?.id;

  // Handle various file parsing scenarios from koa-body
  let uploadedFile: any = null;
  if (files?.excelFile) {
    uploadedFile = Array.isArray(files.excelFile)
      ? files.excelFile[0]
      : files.excelFile;
  }

  const tempFilePath = uploadedFile?.filepath || uploadedFile?.path;

  if (!tempFilePath) {
    ctx.status = 400;
    ctx.body = { error: "No Excel file uploaded." };
    return;
  }

  try {
    const result = await importUsers(tempFilePath, userId);
    ctx.status = 200;
    ctx.body = result;
  } catch (error: any) {
    console.error("Import Users Controller Error:", error);
    ctx.status = 400;
    ctx.body = { error: error.message };
  } finally {
    // Always cleanup temp file
    try {
      if (tempFilePath) await fs.unlink(tempFilePath);
    } catch (cleanupError) {
      console.error("Failed to delete temp file:", cleanupError);
    }
  }
};
