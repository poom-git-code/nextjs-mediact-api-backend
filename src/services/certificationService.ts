import CertificationModel from "../models/CertificationModel";
import UserRoleModel from "../models/UserRolesModel";
import RoleModel from "../models/RolesModel";
import UserModel from "../models/UserModel";
import { PipedaUserDataHandler } from "../middleware/pipedaUserDataHandler";
import {
  getUserAttributes,
  getBasicUserAttributes,
  getUserWithUsernameAttributes,
  decryptAndCleanUserData,
} from "../utils/encryptedFieldMapping";

export const getAllCertifications = async () => {
  return await CertificationModel.findAll({
    where: { is_active: true },
    order: [["id", "ASC"]],
  });
};

export const getCertificationById = async (id: number) => {
  return await CertificationModel.findByPk(id);
};

export const getCertificationsByRole = async (userId: number) => {
  const user = await UserModel.findByPk(userId, {
    attributes: getUserWithUsernameAttributes(),
    include: [
      {
        model: UserRoleModel,
        as: "user_roles",
        where: { is_active: true },
        required: false,
        attributes: ["id", "user_id", "role_id", "is_active", "assigned_at"],
        include: [
          {
            model: RoleModel,
            as: "role",
            attributes: ["id", "name", "description"],
            required: false,
          },
        ],
      },
    ],
  });
  if (!user) {
    return {
      user: [],
      certifications: [],
    };
  }

  const userRoles = (user as any).user_roles as UserRoleModel[] | undefined;

  if (!userRoles || userRoles.length === 0) {
    // Decrypt user data for response
    const decryptedUser = decryptAndCleanUserData(user);

    return {
      user: [
        {
          id: decryptedUser.id,
          username: decryptedUser.username,
          first_name: decryptedUser.first_name,
          last_name: decryptedUser.last_name,
          email: decryptedUser.email,
          user_roles: [],
        },
      ],
      certifications: [],
    };
  }
  // Get all role IDs that the user has
  const roleIds = userRoles.map((userRole) => userRole.role_id);

  // Filter certifications by user's role IDs only
  const certifications = await CertificationModel.findAll({
    where: {
      role_id: roleIds,
      is_active: true,
    },
    order: [["name_th", "ASC"]],
  });

  // Decrypt user data for response
  const decryptedUser = decryptAndCleanUserData(user);

  return {
    user: [
      {
        id: decryptedUser.id,
        username: decryptedUser.username,
        first_name: decryptedUser.first_name,
        last_name: decryptedUser.last_name,
        email: decryptedUser.email,
        user_roles: userRoles,
      },
    ],
    certifications: certifications,
  };
};

export const createCertification = async (data: any, userId: number) => {
  return await CertificationModel.create({
    ...data,
    created_by: userId,
    updated_by: userId,
    created_at: new Date(),
    updated_at: new Date(),
  });
};

export const updateCertification = async (
  id: number,
  updates: any,
  userId: number
) => {
  const cert = await CertificationModel.findByPk(id);
  if (!cert) throw new Error("Certification not found");
  return await cert.update({
    ...updates,
    updated_by: userId,
    updated_at: new Date(),
  });
};

export const deleteCertification = async (id: number, userId: number) => {
  const cert = await CertificationModel.findByPk(id);
  if (!cert) throw new Error("Certification not found");
  return await cert.update({
    is_active: false,
    updated_by: userId,
    updated_at: new Date(),
  });
};

export const getCertificationsByRoleId = async (userId: number) => {
  const user = await UserModel.findByPk(userId, {
    attributes: getUserWithUsernameAttributes(),
    include: [
      {
        model: UserRoleModel,
        as: "user_roles",
        where: { is_active: true },
        required: false,
        attributes: ["id", "user_id", "role_id", "is_active", "assigned_at"],
        include: [
          {
            model: RoleModel,
            as: "role",
            attributes: ["id", "name", "description"],
            required: false,
          },
        ],
      },
    ],
  });
  if (!user) {
    return {
      user: [],
      certifications: [],
    };
  }

  const userRoles = (user as any).user_roles as UserRoleModel[] | undefined;

  if (!userRoles || userRoles.length === 0) {
    // Decrypt user data for response
    const decryptedUser = decryptAndCleanUserData(user);

    return {
      user: [
        {
          id: decryptedUser.id,
          username: decryptedUser.username,
          first_name: decryptedUser.first_name,
          last_name: decryptedUser.last_name,
          email: decryptedUser.email,
          user_roles: [],
        },
      ],
      certifications: [],
    };
  }
  // Get all role IDs that the user has
  const roleIds = userRoles.map((userRole) => userRole.role_id);

  // Filter certifications by user's role IDs only
  const certifications = await CertificationModel.findAll({
    where: {
      role_id: roleIds,
      is_active: true,
    },
    order: [["name_th", "ASC"]],
  });

  // Decrypt user data for response
  const decryptedUser = decryptAndCleanUserData(user);

  return {
    user: [
      {
        id: decryptedUser.id,
        username: decryptedUser.username,
        first_name: decryptedUser.first_name,
        last_name: decryptedUser.last_name,
        email: decryptedUser.email,
        user_roles: userRoles,
      },
    ],
    certifications: certifications,
  };
};
