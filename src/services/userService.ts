import UserRoleModel from "../models/UserRolesModel";
import {
  getUserAttributes,
  getBasicUserAttributes,
  getUserWithUsernameAttributes,
  decryptAndCleanUserData,
  decryptAndCleanUsersData,
} from "../utils/encryptedFieldMapping";
import FacilityModel from "../models/FacilitiesModel";
import UserEmploymentModel from "../models/UserEmploymentsModel";
import UserModel from "../models/UserModel";
import RoleModel from "../models/RolesModel";
import DepartmentModel from "../models/DepartmentModel";
import FacilityTypeModel from "../models/FacilityTypesModel";
import DepartmentTypeModel from "../models/DepartmentTypesModel";
import AddressModel from "../models/AddressesModel";
import AddressTypeModel from "../models/AddressTypesModel";
import PipedaEncryptionService from "./pipedaEncryptionService";
import AuditService from "./auditService";
import PipedaUserDataHandler from "../middleware/pipedaUserDataHandler";
import bcrypt from "bcrypt";
import GenderModel from "../models/GenderModel";
import UserStatusModel from "../models/UserStatusModel";
import DepartmentSupervisorModel from "../models/DepartmentSupervisorModel";
import { Op, QueryTypes } from "sequelize";
import * as UserGroupTagService from "./userGroupTagService";
import { sequelize } from "../config/database";

import * as xlsx from "xlsx";
import * as fs from "fs";
import * as path from "path";

export const createUser = async (data: any, group_tags: any) => {
  console.log("Creating user with data:", data);

  // Check Username
  if (data.username) {
    const existingUser = await UserModel.findOne({
      where: { username: data.username },
    });
    if (existingUser) {
      throw new Error(
        `Username "${data.username}" is already taken. Please choose another one.`
      );
    }
  }

  // Hash the password before saving
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  // Extract group_tags before creating user (เพื่อไม่ให้ส่งไปยัง UserModel.create)
  const { ...userData } = data;
  console.log("Creating user with group_tags:", group_tags);

  // ใช้ PIPEDA handler เพื่อ encrypt ข้อมูลและลบ plain text
  const encryptedUserData =
    PipedaUserDataHandler.prepareEncryptedData(userData);

  const user = await UserModel.create(encryptedUserData);

  console.log("Creating user with user:", user);

  // Log PIPEDA compliance audit for new user creation
  const piiFields = Object.keys(userData).filter((key) =>
    [
      "email",
      "first_name",
      "last_name",
      "phone_number",
      "date_of_birth",
      "id_card_number",
      "passport_number",
      "occupation_number",
      "ID_line",
    ].includes(key)
  );

  if (piiFields.length > 0) {
    await AuditService.log({
      userId: userData.created_by || user.id,
      action: "USER_CREATE_ENCRYPTED",
      tableName: "users",
      recordId: user.id,
      newValues: {
        action: "new_user_creation",
        encrypted_fields: piiFields,
        encryption_version: "v1.0",
        pipeda_compliant: true,
      },
    });

    console.log(
      `✅ User created with PIPEDA encryption: ID ${
        user.id
      }, fields: ${piiFields.join(", ")}`
    );
  }

  // จัดการ group_tags หลังจากสร้าง user แล้ว
  if (group_tags && Array.isArray(group_tags) && group_tags.length > 0) {
    try {
      // แปลง string เป็น number หากจำเป็น
      const groupTagIds = group_tags
        .map((tag) => (typeof tag === "string" ? parseInt(tag, 10) : tag))
        .filter((id) => !isNaN(id) && id > 0);

      if (groupTagIds.length > 0) {
        console.log("Adding user to group tags:", groupTagIds);

        await UserGroupTagService.addUserToMultipleGroupTags(
          user.id,
          groupTagIds,
          userData.created_by || 1
        );

        console.log("End");
      }
    } catch (error) {
      console.error("Error adding user to group tags:", error);
      // อาจจะต้องการ rollback การสร้าง user หรือ log error
    }
  }

  return user;
};

export const updateUser = async (id: number, updates: Partial<UserModel>) => {
  const user = await UserModel.findByPk(id);
  if (!user) {
    throw new Error("User not found");
  }

  if (updates.email && updates.email !== user.email) {
    const existingEmailUser = await UserModel.findOne({
      where: { email: updates.email, id: { [Op.ne]: id } },
    });
    if (existingEmailUser) {
      throw new Error(
        `Email "${updates.email}" is already in use by another user.`
      );
    }
  }

  if (updates.username && updates.username !== user.username) {
    const existingUsernameUser = await UserModel.findOne({
      where: { username: updates.username, id: { [Op.ne]: id } },
    });
    if (existingUsernameUser) {
      throw new Error(`Username "${updates.username}" is already taken.`);
    }
  }

  if (
    updates.password &&
    user.password !== updates.password &&
    user.password !== null &&
    user.password !== ""
  ) {
    console.log("password is difference ", updates.password);

    updates.password = await bcrypt.hash(updates.password, 10);
  } else {
    delete updates.password;
  }

  // Extract group_tags before updating user (เพื่อไม่ให้ส่งไปยัง user.update)
  const { group_tags, ...userData } = updates as any;

  // ใช้ PIPEDA handler เพื่อ encrypt ข้อมูลและลบ plain text
  const encryptedData = PipedaUserDataHandler.prepareEncryptedData(userData);

  const updatedUser = await user.update(encryptedData);

  // Log PIPEDA compliance audit for user update
  const changedFields = Object.keys(userData).filter((key) =>
    [
      "email",
      "first_name",
      "last_name",
      "phone_number",
      "date_of_birth",
      "id_card_number",
      "passport_number",
      "occupation_number",
      "ID_line",
    ].includes(key)
  );

  if (changedFields.length > 0) {
    await AuditService.log({
      userId: userData.updated_by || id,
      action: "USER_UPDATE_ENCRYPTED",
      tableName: "users",
      recordId: id,
      newValues: {
        action: "user_data_update",
        encrypted_fields: changedFields,
        encryption_version: "v1.0",
        pipeda_compliant: true,
      },
    });

    console.log(
      `✅ User data updated with PIPEDA encryption: ID ${id}, fields: ${changedFields.join(
        ", "
      )}`
    );
  }

  // จัดการ group_tags หลังจาก update user แล้ว
  if (group_tags && Array.isArray(group_tags)) {
    try {
      // ลบ user ออกจาก group tags เดิมก่อน
      await UserGroupTagService.removeUserFromAllGroupTags(id);

      // เพิ่ม user เข้า group tags ใหม่
      if (group_tags.length > 0) {
        // แปลง string เป็น number หากจำเป็น
        const groupTagIds = group_tags
          .map((tag) => (typeof tag === "string" ? parseInt(tag, 10) : tag))
          .filter((id) => !isNaN(id) && id > 0);

        if (groupTagIds.length > 0) {
          await UserGroupTagService.addUserToMultipleGroupTags(
            id,
            groupTagIds,
            userData.updated_by || 1
          );
        }
      }
    } catch (error) {
      console.error("Error updating user group tags:", error);
      // อาจจะต้องการ log error หรือ handle error ตามต้องการ
    }
  }

  return updatedUser;
};

export const updateUserMobile = async (
  id: number,
  updates: Partial<UserModel>
) => {
  const user = await UserModel.findByPk(id);
  if (!user) {
    throw new Error("User not found");
  }

  if (updates.email && updates.email !== user.email) {
    const existingEmailUser = await UserModel.findOne({
      where: { email: updates.email, id: { [Op.ne]: id } },
    });
    if (existingEmailUser) {
      throw new Error("Email already in use");
    }
    // Reset email verification status if email is changed
    updates.is_verified_email = false;
    updates.verified_email_date = null;
  }

  // Check for duplicate phone number (if phone number is being updated)
  if (updates.phone_number && updates.phone_number !== user.phone_number) {
    const existingPhoneUser = await UserModel.findOne({
      where: { phone_number: updates.phone_number, id: { [Op.ne]: id } },
    });
    if (existingPhoneUser) {
      throw new Error("Phone number already in use");
    }

    updates.is_verified_phone = false;
    updates.verified_phone_date = null;
  }

  // Check for duplicate username (if username is being updated)
  if (updates.username && updates.username !== user.username) {
    const existingUsernameUser = await UserModel.findOne({
      where: { username: updates.username, id: { [Op.ne]: id } },
    });
    if (existingUsernameUser) {
      throw new Error("Username already in use");
    }
  }

  // Extract role_id from updates to handle separately
  const { role_id, ...userData } = updates as any;

  if ('nickname' in userData && userData.nickname === "") {
    userData.nickname = null;
  }
  if ('ID_line' in userData && userData.ID_line === "") {
    userData.ID_line = null;
  }

  let rawCreatedAt: string | undefined;
  let rawUpdatedAt: string | undefined;
  
  if (userData.created_at) {
    const dt = new Date(userData.created_at);
    rawCreatedAt = dt.toISOString().slice(0, 19).replace('T', ' ');
    delete userData.created_at; 
  }
  
  if (userData.updated_at) {
    const dt = new Date(userData.updated_at);
    rawUpdatedAt = dt.toISOString().slice(0, 19).replace('T', ' ');
    delete userData.updated_at; 
  }

  // ใช้ PIPEDA handler เพื่อ encrypt ข้อมูลและลบ plain text
  const encryptedUpdates = PipedaUserDataHandler.prepareEncryptedData(userData);

  const updatedUser = await user.update(encryptedUpdates);

  if (rawCreatedAt || rawUpdatedAt) {
    const updates: string[] = [];
    const replacements: any = { id };
    
    if (rawCreatedAt) {
      updates.push('created_at = :created_at');
      replacements.created_at = rawCreatedAt;
    }
    if (rawUpdatedAt) {
      updates.push('updated_at = :updated_at');
      replacements.updated_at = rawUpdatedAt;
    }
    
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = :id`;
    
    await sequelize.query(sql, {
      replacements,
      type: QueryTypes.UPDATE
    });
  }

  // Reload user to get final values
  await updatedUser.reload();

  // Handle role_id update if provided
  if (role_id !== undefined) {
    try {
      // Get current active user roles with role details
      const currentUserRoles = await UserRoleModel.findAll({
        where: { user_id: id, is_active: true },
        include: [
          {
            model: RoleModel,
            as: "role",
            attributes: ["id", "name", "user_view"],
          },
        ],
      });

      // Check if user has permission to change role (must have at least one role with user_view = true)
      const hasPermission = currentUserRoles.some(
        (userRole) => (userRole as any).role?.user_view === true
      );

      if (!hasPermission) {
        throw new Error(
          "User does not have permission to change role (no user_view role found)"
        );
      }

      if (role_id && role_id > 0) {
        // Check if new role exists and has user_view = true
        const newRole = await RoleModel.findByPk(role_id);
        if (!newRole) {
          throw new Error("Role not found");
        }

        if (!newRole.user_view) {
          throw new Error(
            "Cannot assign role: role does not have user_view permission"
          );
        }

        // Find the user_role that has role.user_view = true (this is the one we should update)
        const editableUserRole = currentUserRoles.find(
          (userRole) => (userRole as any).role?.user_view === true
        );

        if (editableUserRole) {
          // Update only the user_role that has user_view = true
          await editableUserRole.update({
            role_id: role_id,
            assigned_at: new Date(),
          });

          // console.log(`✅ User ${id} user_role ID ${editableUserRole.id} updated from role_id ${(editableUserRole as any).role?.id} to role_id: ${role_id}`);
        } else {
          // If no existing editable role, create new one
          await UserRoleModel.create({
            user_id: id,
            role_id: role_id,
            assigned_at: new Date(),
            is_active: true,
          });

          // console.log(`✅ User ${id} new user_role created with role_id: ${role_id}`);
        }
      } else {
        // If role_id is null/0, deactivate only user_roles that have role.user_view = true
        const editableUserRoles = currentUserRoles.filter(
          (userRole) => (userRole as any).role?.user_view === true
        );

        for (const userRole of editableUserRoles) {
          await userRole.update({ is_active: false });
          // console.log(`✅ User ${id} user_role ID ${userRole.id} deactivated (role had user_view = true)`);
        }
      }
    } catch (roleError) {
      console.error("Error updating user role in mobile update:", roleError);
      // Don't throw error for role update failure, just log it
      // The user data update should still succeed
    }
  }

  // Log PIPEDA compliance audit for mobile user update
  const changedFields = Object.keys(userData).filter((key) =>
    [
      "email",
      "first_name",
      "last_name",
      "phone_number",
      "date_of_birth",
      "id_card_number",
      "passport_number",
      "occupation_number",
      "ID_line",
    ].includes(key)
  );

  if (changedFields.length > 0 || role_id !== undefined) {
    const auditData: any = {
      action: "mobile_user_data_update",
      pipeda_compliant: true,
    };

    if (changedFields.length > 0) {
      auditData.encrypted_fields = changedFields;
      auditData.encryption_version = "v1.0";
    }

    if (role_id !== undefined) {
      auditData.role_updated = true;
      auditData.new_role_id = role_id;
    }

    await AuditService.log({
      userId: userData.updated_by || id,
      action: "USER_MOBILE_UPDATE_ENCRYPTED",
      tableName: "users",
      recordId: id,
      newValues: auditData,
    });

    const logMessage =
      changedFields.length > 0
        ? `✅ User mobile data updated with PIPEDA encryption: ID ${id}, fields: ${changedFields.join(
            ", "
          )}`
        : `✅ User mobile role updated: ID ${id}`;
    console.log(
      logMessage + (role_id !== undefined ? `, role_id: ${role_id}` : "")
    );
  }

  return updatedUser;
};

export const deleteUser = async (id: number) => {
  const user = await UserModel.findByPk(id);
  if (!user) {
    throw new Error("User not found");
  }
  return await user.update({ status: "inactive" });
};

export const getUserById = async (id: number) => {
  const user = await UserModel.findByPk(id, {
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
        attributes: [
          "position_id",
          "start_date",
          "is_part_time",
          "is_job_applicant",
          "facility_id",
        ],
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
      {
        model: AddressModel,
        as: "user_addresses",
        where: { is_active: true },
        required: false,
        attributes: [
          "id",
          "address_type",
          "address_line1",
          "address_line2",
          "province",
          "district",
          "sub_district",
          "postal_code",
          "country",
          "is_active",
        ],
        include: [
          {
            model: AddressTypeModel,
            as: "address_type_info",
            attributes: ["id", "name"],
            required: false,
          },
        ],
      },
    ],
  });
  if (!user) {
    throw new Error("User not found");
  }

  // Decrypt user data for PIPEDA compliance
  const decryptedUser = decryptAndCleanUserData(user);

  const employments = (decryptedUser as any).user_employment as
    | any[]
    | undefined;
  if (Array.isArray(employments) && employments.length > 0) {
    let mainIndex = -1;
    for (let i = 0; i < employments.length; i++) {
      const e = employments[i];
      const isPartTime = !!e.is_part_time;
      const isJobApplicant = !!e.is_job_applicant;
      if (!isPartTime && !isJobApplicant) {
        mainIndex = i;
        break;
      }
    }

    // Attach flag: true for chosen main, false for others
    for (let i = 0; i < employments.length; i++) {
      (employments[i] as any).main_department = i === mainIndex;
    }
  }

  return decryptedUser;
};

export const getAllUsers = async (
  requestingUserId?: number,
  page: number = 1,
  pageSize: number = 20,
  searchQuery?: string,
  startDate?: string,
  endDate?: string,
  facilityId?: number,
  departmentId?: number
) => {
  const limit = pageSize;
  const offset = (page - 1) * pageSize; // --- 1. Where Clause (User) ---

  const whereClause: any = {};
  if (searchQuery) {
    whereClause[Op.or] = {
      [Op.or]: [
        { first_name: { [Op.like]: `%${searchQuery}%` } },
        { last_name: { [Op.like]: `%${searchQuery}%` } },
        { email: { [Op.like]: `%${searchQuery}%` } },
        { username: { [Op.like]: `%${searchQuery}%` } },
        { id: { [Op.like]: `%${searchQuery}%` } },
        { phone_number: { [Op.like]: `%${searchQuery}%` } },
      ],
    };
  }
  if (startDate && endDate) {
    whereClause.created_at = {
      [Op.between]: [new Date(startDate), new Date(endDate)],
    };
  } else if (startDate) {
    whereClause.created_at = { [Op.gte]: new Date(startDate) };
  } // --- 2. Include Clause (Base) ---

  let includeClause: any[] = [
    {
      model: UserModel,
      as: "created_by_user",
      attributes: getBasicUserAttributes(),
      required: false,
    },
    {
      model: UserModel,
      as: "updated_by_user",
      attributes: getBasicUserAttributes(),
      required: false,
    },
    {
      model: GenderModel,
      as: "user_gender",
      attributes: ["id", "name"],
      required: false,
    },
    {
      model: UserStatusModel,
      as: "user_status",
      attributes: ["id", "name"],
      required: false,
    },
  ]; // --- 3. Employment Filtering Logic (ส่วนที่แก้ไข) ---

  const employmentWhere: any = { is_active: true };
  let employmentRequired = false; // ค่าเริ่มต้นเป็น LEFT JOIN (required: false) // 3.1 ตรวจสอบสิทธิ์ (ถ้า login)

  if (requestingUserId) {
    const requestingUser = await UserModel.findByPk(requestingUserId, {
      include: [
        {
          model: UserRoleModel,
          as: "user_role",
          include: [{ model: RoleModel, as: "role" }],
        },
        { model: UserEmploymentModel, as: "user_employment" },
      ],
    });

    const userRole = requestingUser?.user_role as UserRoleModel[] | undefined;
    const userEmployment = requestingUser?.user_employment as
      | UserEmploymentModel[]
      | undefined; // ถ้าเป็น "ไม่ใช่" Super Admin (role 1) ให้บังคับกรอง facility ของตัวเอง

    if (
      userRole &&
      userRole.length > 0 &&
      (userRole[0] as any).role?.id !== 1 &&
      userEmployment &&
      userEmployment.length > 0 &&
      userEmployment[0].facility_id
    ) {
      const userFacilityId = userEmployment[0].facility_id;
      employmentWhere.facility_id = userFacilityId;
      employmentRequired = true; // บังคับเป็น INNER JOIN
    }
  } // 3.2 ตรวจสอบ Filter จาก Dropdown (สำหรับ Super Admin) // ถ้ามีการส่ง facilityId มา และยังไม่มีการกำหนด (เช่น non-admin)

  if (facilityId && !employmentWhere.facility_id) {
    employmentWhere.facility_id = facilityId;
    employmentRequired = true; // บังคับเป็น INNER JOIN
  } // 3.3 ตรวจสอบ Filter Department (ถ้ามี)

  if (departmentId) {
    employmentWhere.department_id = departmentId;
    employmentRequired = true; // บังคับเป็น INNER JOIN
  } // 3.4 เพิ่มการ JOIN ตาราง Employment (ทำงานทุกครั้ง)

  includeClause.push({
    model: UserEmploymentModel,
    as: "user_employment",
    where: employmentWhere,
    required: employmentRequired, // ถ้ามีการกรอง = true (INNER JOIN), ถ้าไม่ = false (LEFT JOIN)
    attributes: ["facility_id", "position_id", "start_date"],
    include: [
      {
        model: FacilityModel,
        as: "facility",
        attributes: ["id", "name"],
        required: false,
      },
      {
        model: DepartmentModel,
        as: "department",
        attributes: ["id", "name"],
        required: false,
      },
    ],
  }); // --- 4. Fetch Data ---

  const { count, rows } = await UserModel.findAndCountAll({
    where: whereClause,
    include: includeClause,
    order: [["created_at", "DESC"]],
    limit: limit,
    offset: offset,
    distinct: true, // สำคัญมากเมื่อ JOIN แบบ hasMany
  }); // --- 5. Return Data ---

  const cleanUsers = decryptAndCleanUsersData(rows);
  return { users: cleanUsers, total: count };
};
export const updateUserStatus = async (id: number) => {
  try {
    const result = await sequelize.transaction(async (t) => {
      const user = await UserModel.findByPk(id, { transaction: t });
      if (!user) {
        throw new Error("User not found.");
      }

      await UserEmploymentModel.update(
        { is_active: false },
        {
          where: { user_id: id },
          transaction: t,
        }
      );

      await DepartmentSupervisorModel.update(
        { is_active: false },
        {
          where: { user_id: id },
          transaction: t,
        }
      );

      const updatedUser = await user.update(
        { status_id: 2 },
        { transaction: t }
      );

      return updatedUser;
    });

    return result;
  } catch (err) {
    console.error("Error in updateUserStatus:", err);
    throw err;
  }
};

export const getUserByFacility = async (userId: number) => {
  // ค้นหา facility_id ของ user ที่ระบุ
  const userWithFacility = await UserModel.findOne({
    where: { id: userId },
    include: [
      {
        model: UserEmploymentModel,
        as: "user_employment",
        where: { is_active: true },
        required: false,
        include: [
          {
            model: FacilityModel,
            as: "facility",
            where: { is_active: true },
            required: false,
          },
        ],
      },
    ],
  });

  const user_employment = userWithFacility?.user_employment as
    | UserEmploymentModel[]
    | undefined;

  if (!user_employment || user_employment.length === 0) {
    throw new Error("User employment data not found or empty");
  }

  if (!user_employment[0].facility_id) {
    throw new Error("Facility ID not found for the user");
  }

  const facilityId = user_employment[0].facility_id;
  // console.log("facilityId: ", facilityId);

  // ค้นหา User ทั้งหมดที่อยู่ใน facility_id นี้
  const users = await UserModel.findAll({
    include: [
      {
        model: UserRoleModel,
        as: "user_role",
        where: { is_active: true },
        required: true, // ต้องมีข้อมูล employment ที่ตรงกับ facility_id
        include: [
          {
            model: RoleModel,
            as: "role",
            // where: { is_active: true },
            required: true,
          },
        ],
      },
      {
        model: UserEmploymentModel,
        as: "user_employment",
        where: { facility_id: facilityId, is_active: true },
        required: true, // ต้องมีข้อมูล employment ที่ตรงกับ facility_id
        include: [
          {
            model: DepartmentModel,
            as: "department",
            // where: { is_active: true },
            required: true,
            include: [
              {
                model: DepartmentTypeModel,
                as: "department_type",
                // where: { is_active: true },
                required: true,
              },
            ],
          },
          {
            model: FacilityModel,
            as: "facility",
            // where: { is_active: true },
            required: true,
            include: [
              {
                model: FacilityTypeModel,
                as: "facility_type",
                // where: { is_active: true },
                required: true,
              },
            ],
          },
        ],
      },
    ],
  });

  if (!users || users.length === 0) {
    throw new Error("No users found for the given facility");
  }

  // Decrypt user data for PIPEDA compliance
  const decryptedUsers = users.map((user) => decryptAndCleanUserData(user));

  return decryptedUsers;
};

export const getUserInfo = async (id: number) => {
  const user = await UserModel.findByPk(id, {
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
            where: {
              id: { [Op.ne]: 1 },
            },
          },
        ],
      },
      {
        model: UserEmploymentModel,
        as: "user_employment",
        attributes: [
          "position_id",
          "start_date",
          "is_part_time",
          "is_job_applicant",
        ],
        where: { is_active: true },
        required: false,
        include: [
          {
            model: DepartmentModel,
            as: "department",
            attributes: [
              "id",
              "name",
              "day_off_submission_start_date",
              "day_off_submission_start_time",
              "day_off_submission_end_date",
              "day_off_submission_end_time",
            ],
          },
          {
            model: FacilityModel,
            as: "facility",
            attributes: [
              "id",
              "name",
              "address",
              "latitude",
              "longitude",
              "full_schedule",
              "mediact_match",
            ],
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
      {
        model: DepartmentSupervisorModel,
        as: "supervisor_roles",
        where: { is_active: true },
        required: false,
        attributes: ["id", "department_id", "role", "is_active"],
        include: [
          {
            model: DepartmentModel,
            as: "department",
            attributes: ["id", "name"],
          },
        ],
      },
    ],
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Decrypt user data for PIPEDA compliance
  const decryptedUser = decryptAndCleanUserData(user);

  const employments = (decryptedUser as any).user_employment as
    | any[]
    | undefined;
  if (Array.isArray(employments) && employments.length > 0) {
    let mainIndex = -1;
    for (let i = 0; i < employments.length; i++) {
      const e = employments[i];
      const isPartTime = !!e.is_part_time;
      const isJobApplicant = !!e.is_job_applicant;
      if (!isPartTime && !isJobApplicant) {
        mainIndex = i;
        break;
      }
    }

    // Attach flag: true for chosen main, false for others
    for (let i = 0; i < employments.length; i++) {
      (employments[i] as any).main_department = i === mainIndex;
    }
  }

  const supervisorRoles = (decryptedUser as any).supervisor_roles || [];
  const isSupervisor = supervisorRoles.length > 0;
  const supervisorDepartments = supervisorRoles.map((supervisor: any) => ({
    department_id: supervisor.department_id,
    department_name: supervisor.department?.name || null,
    supervisor_role: supervisor.role,
    is_active: supervisor.is_active,
  }));

  return {
    user: {
      id: decryptedUser.id,
      username: decryptedUser.username,
      email: decryptedUser.email,
      first_name: decryptedUser.first_name,
      last_name: decryptedUser.last_name,
      nickname: decryptedUser.nickname || null,
      country_code: decryptedUser.country_code,
      phone_number: decryptedUser.phone_number,
      profile_picture: decryptedUser.profile_picture,
      date_of_birth: decryptedUser.date_of_birth,
      id_card_number: decryptedUser.id_card_number,
      occupation_document_url: decryptedUser.occupation_document_url,
      occupation_number: decryptedUser.occupation_number,
      // occupation_experienced: decryptedUser.occupation_experienced,
      occupation_expired: decryptedUser.occupation_expired,
      occupation_passed_unit: decryptedUser.occupation_passed_unit,
      ID_line: decryptedUser.ID_line,
      is_verified_email: decryptedUser.is_verified_email,
      is_verified_phone: decryptedUser.is_verified_phone,
      last_password_change: decryptedUser.last_password_change,
      signup_date: decryptedUser.created_at,
      gender: decryptedUser.user_gender?.name || null,
      status: decryptedUser.user_status?.name || null,
      user_role: decryptedUser.user_role,
      user_employment: decryptedUser.user_employment,
      is_supervisor: isSupervisor,
      supervisor_departments: supervisorDepartments,
    },
  };
};

export const importUsers = async (
  filePath: string,
  createdByUserId: number
) => {
  if (!filePath) throw new Error("File path is missing.");

  // อ่านไฟล์ Excel
  const normalizedFilePath = path.normalize(filePath);
  const fileBuffer = fs.readFileSync(normalizedFilePath);
  const workbook = xlsx.read(fileBuffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const excelData: any[] = xlsx.utils.sheet_to_json(worksheet);

  if (excelData.length === 0) throw new Error("ไฟล์ Excel ไม่มีข้อมูล");

  // เตรียมข้อมูล Reference (Role, Facility, Department)
  const roles = await RoleModel.findAll();
  const facilities = await FacilityModel.findAll();
  const departments = await DepartmentModel.findAll();

  // เตรียมข้อมูลสำหรับตรวจสอบความซ้ำ
  // ดึง Username และ Email ทั้งหมดที่มีใน DB มาเก็บใน Set
  const existingUsers = await UserModel.findAll({
    attributes: ["username", "email"],
  });
  const dbUsernames = new Set(existingUsers.map((u) => u.username));
  const dbEmails = new Set(
    existingUsers.map((u) => u.email).filter((e) => e) // กรองค่า null/empty ออก
  );

  // Set สำหรับตรวจสอบความซ้ำภายในไฟล์ Excel เอง
  const usernamesInFile = new Set<string>();
  const emailsInFile = new Set<string>();

  // Helper: ค้นหา ID จาก ชื่อ
  const findId = (input: any, collection: any[]) => {
    if (!input) return null;
    if (typeof input === "number") return input;
    const found = collection.find(
      (item) => item.name.toLowerCase() === String(input).trim().toLowerCase()
    );
    return found ? found.id : null;
  };

  const validationErrors: string[] = [];
  const usersToCreate: any[] = [];
  const targetKeys = [
    "first_name",
    "last_name",
    "username",
    "password",
    "role",
    "email",
    "facility",
    "department",
  ];

  //วนลูปตรวจสอบข้อมูลทีละแถว
  for (let i = 0; i < excelData.length; i++) {
    const row = excelData[i];
    const rowNum = i + 2; // +2 เพราะ index เริ่ม 0 และ Excel มี Header

    // Clean Key
    const normalizedRow: any = {};
    Object.keys(row).forEach((key) => {
      const cleanKey = key.trim().toLowerCase();
      if (targetKeys.includes(cleanKey)) {
        normalizedRow[cleanKey] = row[key];
      }
    });

    // Skip Empty Rows
    if (
      !normalizedRow.first_name &&
      !normalizedRow.username &&
      !normalizedRow.password
    ) {
      continue;
    }

    // --- Validation Start ---

    //Check Required Fields
    const missingFields = [];
    if (!normalizedRow.first_name) missingFields.push("first_name");
    if (!normalizedRow.last_name) missingFields.push("last_name");
    if (!normalizedRow.username) missingFields.push("username");
    if (!normalizedRow.password) missingFields.push("password");
    if (!normalizedRow.role) missingFields.push("role");

    if (missingFields.length > 0) {
      validationErrors.push(
        `แถวที่ ${rowNum}: ขาดข้อมูลจำเป็น [${missingFields.join(", ")}]`
      );
      continue; // ถ้าขาดข้อมูลจำเป็น ข้ามไปเช็คแถวถัดไปเลย
    }

    // Check Duplicate Username
    const username = String(normalizedRow.username).trim();

    // ซ้ำในไฟล์เดียวกัน
    if (usernamesInFile.has(username)) {
      validationErrors.push(
        `แถวที่ ${rowNum}: Username '${username}' ซ้ำกับข้อมูลอื่นในไฟล์ Excel`
      );
    } else {
      usernamesInFile.add(username);
    }

    // ซ้ำใน Database
    if (dbUsernames.has(username)) {
      validationErrors.push(
        `แถวที่ ${rowNum}: Username '${username}' มีอยู่ในระบบแล้ว`
      );
    }

    // Check Duplicate Email
    if (normalizedRow.email) {
      const email = String(normalizedRow.email).trim();

      // ซ้ำในไฟล์เดียวกัน
      if (emailsInFile.has(email)) {
        validationErrors.push(
          `แถวที่ ${rowNum}: Email '${email}' ซ้ำกับข้อมูลอื่นในไฟล์ Excel`
        );
      } else {
        emailsInFile.add(email);
      }

      // ซ้ำใน Database
      if (dbEmails.has(email)) {
        validationErrors.push(
          `แถวที่ ${rowNum}: Email '${email}' มีอยู่ในระบบแล้ว`
        );
      }
    }

    // Verify References
    const roleId = findId(normalizedRow.role, roles);
    if (!roleId) {
      validationErrors.push(
        `แถวที่ ${rowNum}: ไม่พบ Role ชื่อ '${normalizedRow.role}'`
      );
    }

    let facilityId = null;
    let departmentId = null;

    if (normalizedRow.facility) {
      facilityId = findId(normalizedRow.facility, facilities);
      if (!facilityId) {
        validationErrors.push(
          `แถวที่ ${rowNum}: ไม่พบ Facility '${normalizedRow.facility}'`
        );
      }
    }

    if (normalizedRow.department) {
      departmentId = findId(normalizedRow.department, departments);
      if (!departmentId) {
        validationErrors.push(
          `แถวที่ ${rowNum}: ไม่พบ Department '${normalizedRow.department}'`
        );
      }
    }

    // --- Validation End ---

    // ถ้าไม่มี Error ในแถวนี้ ให้เตรียมข้อมูลสำหรับ Create
    if (validationErrors.length === 0) {
      usersToCreate.push({
        userData: {
          first_name: normalizedRow.first_name,
          last_name: normalizedRow.last_name,
          username: username,
          password: String(normalizedRow.password),
          email: normalizedRow.email
            ? String(normalizedRow.email).trim()
            : null,
          status_id: 1, // Active Default
          created_by: createdByUserId,
          updated_by: createdByUserId,
          need_password_reset: true,
          gender_id: null,
        },
        meta: {
          roleId,
          facilityId,
          departmentId,
        },
      });
    }
  }

  // หากมี Error สะสม ให้ Throw กลับไปทั้งหมดทีเดียว
  if (validationErrors.length > 0) {
    throw new Error(validationErrors.join("\n"));
  }

  if (usersToCreate.length === 0) {
    throw new Error("ไม่พบข้อมูลผู้ใช้งานที่ถูกต้องในไฟล์ หรือไฟล์ว่างเปล่า");
  }

  // เริ่ม Transaction เพื่อบันทึกข้อมูล
  let createdCount = 0;
  await sequelize.transaction(async (t) => {
    for (const item of usersToCreate) {
      // Hash Password
      const hashedPassword = await bcrypt.hash(item.userData.password, 10);

      // Prepare Encrypted Data (PIPEDA)
      const rawUserPayload = { ...item.userData, password: hashedPassword };
      const encryptedPayload =
        PipedaUserDataHandler.prepareEncryptedData(rawUserPayload);

      // Create User
      const user = await UserModel.create(encryptedPayload, { transaction: t });

      // Create Role
      if (item.meta.roleId) {
        await UserRoleModel.create(
          {
            user_id: user.id,
            role_id: item.meta.roleId,
            is_active: true,
            assigned_at: new Date(),
          },
          { transaction: t }
        );
      }

      // Create Employment
      if (item.meta.facilityId) {
        await UserEmploymentModel.create(
          {
            user_id: user.id,
            facility_id: item.meta.facilityId,
            department_id: item.meta.departmentId || null,
            is_active: true,
            start_date: new Date(),
            position_id: null,
          },
          { transaction: t }
        );
      }
      createdCount++;
    }
  });

  // Log Batch Audit
  await AuditService.log({
    userId: createdByUserId,
    action: "USER_IMPORT_BATCH",
    tableName: "users",
    newValues: {
      count: createdCount,
      file: path.basename(filePath),
    },
  });

  return {
    message: "Import Users Successfully",
    count: createdCount,
  };
};
