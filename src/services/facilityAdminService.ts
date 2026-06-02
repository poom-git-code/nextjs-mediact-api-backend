import FacilityAdminModel from "../models/FacilityAdminModel";
import { getUserAttributes, getBasicUserAttributes, getUserWithUsernameAttributes, decryptAndCleanUserData } from "../utils/encryptedFieldMapping";
import FacilityModel from "../models/FacilitiesModel";
import UserModel from "../models/UserModel";
import UserRoleModel from "../models/UserRolesModel";
import { RoleModel } from "../models/RolesModel";
import { Op } from "sequelize";

export const createFacilityAdmin = async (
  data: Partial<FacilityAdminModel>,
  createdBy: number
) => {
  // Check if facility exists
  const facility = await FacilityModel.findByPk(data.facility_id);
  if (!facility) {
    throw new Error("Facility not found");
  }

  // Check if user exists
  const user = await UserModel.findByPk(data.user_id);
  if (!user) {
    throw new Error("User not found");
  }

  // Check if the user is already assigned to this facility
  const existingAssignment = await FacilityAdminModel.findOne({
    where: {
      facility_id: data.facility_id,
      user_id: data.user_id,
      is_active: true,
    },
  });

  if (existingAssignment) {
    throw new Error("User is already assigned as admin for this facility");
  }

  return await FacilityAdminModel.create({
    ...data,
    created_by: createdBy,
    updated_by: createdBy,
  });
};

export const updateFacilityAdmin = async (
  id: number,
  updates: Partial<FacilityAdminModel>,
  updatedBy: number
) => {
  const facilityAdmin = await FacilityAdminModel.findByPk(id);
  if (!facilityAdmin) {
    throw new Error("Facility admin assignment not found");
  }

  // If updating facility_id, check if facility exists
  if (updates.facility_id) {
    const facility = await FacilityModel.findByPk(updates.facility_id);
    if (!facility) {
      throw new Error("Facility not found");
    }
  }

  // If updating user_id, check if user exists
  if (updates.user_id) {
    const user = await UserModel.findByPk(updates.user_id);
    if (!user) {
      throw new Error("User not found");
    }
  }

  // If updating both facility_id and user_id, or either one, check for existing assignment
  if (updates.facility_id || updates.user_id) {
    const facilityId = updates.facility_id || facilityAdmin.facility_id;
    const userId = updates.user_id || facilityAdmin.user_id;

    const existingAssignment = await FacilityAdminModel.findOne({
      where: {
        facility_id: facilityId,
        user_id: userId,
        is_active: true,
        id: { [Op.ne]: id }, // Exclude current record
      },
    });

    if (existingAssignment) {
      throw new Error("User is already assigned as admin for this facility");
    }
  }

  return await facilityAdmin.update({
    ...updates,
    updated_by: updatedBy,
  });
};

export const deleteFacilityAdmin = async (id: number) => {
  const facilityAdmin = await FacilityAdminModel.findByPk(id);
  if (!facilityAdmin) {
    throw new Error("Facility admin assignment not found");
  }
  return await facilityAdmin.destroy();
};

export const getFacilityAdminById = async (id: number) => {
  const facilityAdmin = await FacilityAdminModel.findByPk(id, {
    include: [
      {
        model: FacilityModel,
        as: "facility",
        attributes: ["id", "name", "address", "is_active"],
      },
      {
        model: UserModel,
        as: "user",
        attributes: getBasicUserAttributes(),
      },
    ],
  });
  
  if (!facilityAdmin) {
    throw new Error("Facility admin assignment not found");
  }
  return facilityAdmin;
};

export const getAllFacilityAdmins = async () => {
  const facilityAdmins = await FacilityAdminModel.findAll({
    include: [
      {
        model: FacilityModel,
        as: "facility",
        attributes: ["id", "name", "address", "is_active"],
      },
      {
        model: UserModel,
        as: "user",
        attributes: getUserWithUsernameAttributes(),
      },
    ],
    order: [["created_at", "DESC"]],
  });

  // Decrypt user data in facility admins
  const processedAdmins = facilityAdmins.map((admin: any) => {
    const adminData = admin.get({ plain: true });
    
    if (adminData.user) {
      adminData.user = decryptAndCleanUserData(adminData.user);
    }

    return adminData;
  });

  return processedAdmins;
};

export const getFacilityAdminsByFacility = async (facilityId: number) => {
  // Check if facility exists
  const facility = await FacilityModel.findByPk(facilityId);
  if (!facility) {
    throw new Error("Facility not found");
  }

  const facilityAdmins = await FacilityAdminModel.findAll({
    where: { facility_id: facilityId },
    include: [
      {
        model: FacilityModel,
        as: "facility",
        attributes: ["id", "name", "address", "is_active"],
      },
      {
        model: UserModel,
        as: "user",
        attributes: getUserWithUsernameAttributes(),
        include: [
          {
            model: UserRoleModel,
            as: "user_role",
            required: false,
            attributes: ["id", "user_id", "role_id"],
            include: [
              {
                model: RoleModel,
                as: "role",
                required: false,
                attributes: ["id", "name", "description"]
              }
            ]
          }
        ],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  // Decrypt user data in facility admins
  const processedAdmins = facilityAdmins.map((admin: any) => {
    const adminData = admin.get({ plain: true });
    
    if (adminData.user) {
      adminData.user = decryptAndCleanUserData(adminData.user);
    }

    return adminData;
  });

  return processedAdmins;
};

export const getFacilityAdminsByUser = async (userId: number) => {
  // Check if user exists
  const user = await UserModel.findByPk(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const facilityAdmins = await FacilityAdminModel.findAll({
    where: { user_id: userId },
    include: [
      {
        model: FacilityModel,
        as: "facility",
        attributes: ["id", "name", "address", "is_active"],
      },
      {
        model: UserModel,
        as: "user",
        attributes: getBasicUserAttributes(),
      },
    ],
    order: [["created_at", "DESC"]],
  });

  // Decrypt user data in facility admins
  const processedAdmins = facilityAdmins.map((admin: any) => {
    const adminData = admin.get({ plain: true });
    
    if (adminData.user) {
      adminData.user = decryptAndCleanUserData(adminData.user);
    }

    return adminData;
  });

  return processedAdmins;
};

export const getActiveFacilityAdmins = async () => {
  const facilityAdmins = await FacilityAdminModel.findAll({
    where: { is_active: true },
    include: [
      {
        model: FacilityModel,
        as: "facility",
        attributes: ["id", "name", "address", "is_active"],
      },
      {
        model: UserModel,
        as: "user",
        attributes: getBasicUserAttributes(),
      },
    ],
    order: [["created_at", "DESC"]],
  });

  // Decrypt user data in facility admins
  const processedAdmins = facilityAdmins.map((admin: any) => {
    const adminData = admin.get({ plain: true });
    
    if (adminData.user) {
      adminData.user = decryptAndCleanUserData(adminData.user);
    }

    return adminData;
  });

  return processedAdmins;
};
