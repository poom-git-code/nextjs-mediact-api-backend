import DepartmentSupervisorModel from "../models/DepartmentSupervisorModel";
import { getUserAttributes, getBasicUserAttributes, getUserWithUsernameAttributes, decryptAndCleanUserData } from "../utils/encryptedFieldMapping";
import UserModel from "../models/UserModel";
import DepartmentModel from "../models/DepartmentModel";
import { Op } from "sequelize";
import { PipedaUserDataHandler } from '../middleware/pipedaUserDataHandler';


export const createDepartmentSupervisor = async (data: any, createdByUserId: number) => {
  // Check if user exists
  const user = await UserModel.findByPk(data.user_id);
  if (!user) {
    throw new Error("User not found");
  }

  // Check if department exists
  const department = await DepartmentModel.findByPk(data.department_id);
  if (!department) {
    throw new Error("Department not found");
  }

  // Check if user is already a supervisor for this department
  const existingSupervisor = await DepartmentSupervisorModel.findOne({
    where: {
      department_id: data.department_id,
      user_id: data.user_id,
      is_active: true
    }
  });

  if (existingSupervisor) {
    throw new Error("User is already a supervisor for this department");
  }

  // Create the department supervisor
  const departmentSupervisorData = {
    ...data,
    created_by: createdByUserId,
  };

  return await DepartmentSupervisorModel.create(departmentSupervisorData);
};

export const updateDepartmentSupervisor = async (
  id: number,
  updates: Partial<DepartmentSupervisorModel>,
  updatedByUserId: number
) => {
  const departmentSupervisor = await DepartmentSupervisorModel.findByPk(id);
  if (!departmentSupervisor) {
    throw new Error("Department supervisor not found");
  }

  // If updating user_id or department_id, check if they exist
  if (updates.user_id) {
    const user = await UserModel.findByPk(updates.user_id);
    if (!user) {
      throw new Error("User not found");
    }
  }

  if (updates.department_id) {
    const department = await DepartmentModel.findByPk(updates.department_id);
    if (!department) {
      throw new Error("Department not found");
    }
  }

  // Check for duplicate if updating user_id or department_id
  if (updates.user_id || updates.department_id) {
    const checkUserId = updates.user_id || departmentSupervisor.user_id;
    const checkDepartmentId = updates.department_id || departmentSupervisor.department_id;

    const existingSupervisor = await DepartmentSupervisorModel.findOne({
      where: {
        department_id: checkDepartmentId,
        user_id: checkUserId,
        is_active: true,
        id: { [Op.ne]: id } // Exclude current record
      }
    });

    if (existingSupervisor) {
      throw new Error("User is already a supervisor for this department");
    }
  }

  const updateData = {
    ...updates,
    updated_by: updatedByUserId,
  };

  return await departmentSupervisor.update(updateData);
};

export const deleteDepartmentSupervisor = async (id: number, updatedByUserId: number) => {
  const departmentSupervisor = await DepartmentSupervisorModel.findByPk(id);
  if (!departmentSupervisor) {
    throw new Error("Department supervisor not found");
  }

  // Soft delete by setting is_active to false
  return await departmentSupervisor.update({
    is_active: false,
    updated_by: updatedByUserId,
  });
};

export const getDepartmentSupervisorById = async (id: number) => {
  const departmentSupervisor = await DepartmentSupervisorModel.findByPk(id, {
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: getBasicUserAttributes(),
      },
      {
        model: DepartmentModel,
        as: "department",
        attributes: ["id", "name"],
      },
      {
        model: UserModel,
        as: "created_by_user",
        attributes: getBasicUserAttributes(),
      },
      {
        model: UserModel,
        as: "updated_by_user",
        attributes: getBasicUserAttributes(),
      },
    ],
  });

  if (!departmentSupervisor) {
    throw new Error("Department supervisor not found");
  }

  // Process PIPEDA decryption for department supervisor
  const supervisorData = departmentSupervisor.get({ plain: true });
  
  // Decrypt user data
  if (supervisorData.user) {
    supervisorData.user = decryptAndCleanUserData(supervisorData.user);
  }
  
  // Decrypt created_by_user data
  if (supervisorData.created_by_user) {
    supervisorData.created_by_user = decryptAndCleanUserData(supervisorData.created_by_user);
  }
  
  // Decrypt updated_by_user data
  if (supervisorData.updated_by_user) {
    supervisorData.updated_by_user = decryptAndCleanUserData(supervisorData.updated_by_user);
  }

  return supervisorData;
};

export const getAllDepartmentSupervisors = async (filters: any = {}) => {
  const whereClause: any = {};

  if (filters.department_id) {
    whereClause.department_id = filters.department_id;
  }

  if (filters.user_id) {
    whereClause.user_id = filters.user_id;
  }

  if (filters.role) {
    whereClause.role = filters.role;
  }

  if (filters.is_active !== undefined) {
    whereClause.is_active = filters.is_active;
  }

  return await DepartmentSupervisorModel.findAll({
    where: whereClause,
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: getBasicUserAttributes(),
      },
      {
        model: DepartmentModel,
        as: "department",
        attributes: ["id", "name"],
      },
      {
        model: UserModel,
        as: "created_by_user",
        attributes: getBasicUserAttributes(),
      },
      {
        model: UserModel,
        as: "updated_by_user",
        attributes: getBasicUserAttributes(),
      },
    ],
    order: [["created_at", "DESC"]],
  });
};

export const getDepartmentSupervisorsByDepartment = async (departmentId: number) => {
  return await DepartmentSupervisorModel.findAll({
    where: {
      department_id: departmentId,
      is_active: true
    },
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: getBasicUserAttributes(),
      },
      {
        model: DepartmentModel,
        as: "department",
        attributes: ["id", "name"],
      },
    ],
    order: [["role", "ASC"], ["created_at", "DESC"]],
  });
};

export const getDepartmentSupervisorsByUser = async (userId: number) => {
  return await DepartmentSupervisorModel.findAll({
    where: {
      user_id: userId,
      is_active: true
    },
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: getBasicUserAttributes(),
      },
      {
        model: DepartmentModel,
        as: "department",
        attributes: ["id", "name"],
      },
    ],
    order: [["role", "ASC"], ["created_at", "DESC"]],
  });
};
