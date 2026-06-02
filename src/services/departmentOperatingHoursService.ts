import DepartmentOperatingHoursModel from "../models/DepartmentOperatingHoursModel";
import UserModel from "../models/UserModel";
import DepartmentModel from "../models/DepartmentModel";
import { Op } from "sequelize";
import { getUserAttributes, getBasicUserAttributes, getUserWithUsernameAttributes } from "../utils/encryptedFieldMapping";
import { PipedaUserDataHandler } from '../middleware/pipedaUserDataHandler';

export const createDepartmentOperatingHours = async (data: any, createdByUserId: number) => {
  // Check if department exists
  const department = await DepartmentModel.findByPk(data.department_id);
  if (!department) {
    throw new Error("Department not found");
  }

  // Validate time range
  if (data.start_time >= data.end_time) {
    throw new Error("Start time must be before end time");
  }

  // Check if operating hours for this department and weekday already exist
  const existingOperatingHours = await DepartmentOperatingHoursModel.findOne({
    where: {
      department_id: data.department_id,
      weekday: data.weekday,
      is_active: true
    }
  });

  if (existingOperatingHours) {
    throw new Error("Operating hours for this department and weekday already exist");
  }

  // Create the department operating hours
  const departmentOperatingHoursData = {
    ...data,
    created_by: createdByUserId,
  };

  return await DepartmentOperatingHoursModel.create(departmentOperatingHoursData);
};

export const updateDepartmentOperatingHours = async (
  id: number,
  updates: Partial<DepartmentOperatingHoursModel>,
  updatedByUserId: number
) => {
  const departmentOperatingHours = await DepartmentOperatingHoursModel.findByPk(id);
  if (!departmentOperatingHours) {
    throw new Error("Department operating hours not found");
  }

  // Validate time range if both start_time and end_time are provided
  if (updates.start_time || updates.end_time) {
    const startTime = updates.start_time || departmentOperatingHours.start_time;
    const endTime = updates.end_time || departmentOperatingHours.end_time;
    
    if (startTime >= endTime) {
      throw new Error("Start time must be before end time");
    }
  }

  // Check if department exists if department_id is being updated
  if (updates.department_id) {
    const department = await DepartmentModel.findByPk(updates.department_id);
    if (!department) {
      throw new Error("Department not found");
    }
  }

  // Check for conflicts if department_id or weekday is being updated
  if (updates.department_id || updates.weekday) {
    const departmentId = updates.department_id || departmentOperatingHours.department_id;
    const weekday = updates.weekday || departmentOperatingHours.weekday;
    
    const existingOperatingHours = await DepartmentOperatingHoursModel.findOne({
      where: {
        department_id: departmentId,
        weekday: weekday,
        is_active: true,
        id: { [Op.ne]: id }
      }
    });

    if (existingOperatingHours) {
      throw new Error("Operating hours for this department and weekday already exist");
    }
  }

  const updatedData = {
    ...updates,
    updated_by: updatedByUserId,
  };

  await departmentOperatingHours.update(updatedData);
  return departmentOperatingHours;
};

export const deleteDepartmentOperatingHours = async (id: number, updatedByUserId: number) => {
  const departmentOperatingHours = await DepartmentOperatingHoursModel.findByPk(id);
  if (!departmentOperatingHours) {
    throw new Error("Department operating hours not found");
  }

  // Soft delete by setting is_active to false
  await departmentOperatingHours.update({
    is_active: false,
    updated_by: updatedByUserId,
  });

  return departmentOperatingHours;
};

export const getDepartmentOperatingHoursById = async (id: number) => {
  const departmentOperatingHours = await DepartmentOperatingHoursModel.findByPk(id, {
    include: [
      {
        model: DepartmentModel,
        as: 'department',
        attributes: ['id', 'name']
      },
      {
        model: UserModel,
        as: 'created_by_user',
        attributes: ['id', 'first_name', 'last_name']
      },
      {
        model: UserModel,
        as: 'updated_by_user',
        attributes: ['id', 'first_name', 'last_name']
      }
    ]
  });

  if (!departmentOperatingHours) {
    throw new Error("Department operating hours not found");
  }

  return departmentOperatingHours;
};

export const getAllDepartmentOperatingHours = async (filters: any) => {
  const whereClause: any = {};
  
  if (filters.department_id) {
    whereClause.department_id = filters.department_id;
  }
  
  if (filters.weekday) {
    whereClause.weekday = filters.weekday;
  }
  
  if (filters.is_active !== undefined) {
    whereClause.is_active = filters.is_active;
  }

  return await DepartmentOperatingHoursModel.findAll({
    where: whereClause,
    include: [
      {
        model: DepartmentModel,
        as: 'department',
        attributes: ['id', 'name']
      },
      {
        model: UserModel,
        as: 'created_by_user',
        attributes: ['id', 'first_name', 'last_name']
      },
      {
        model: UserModel,
        as: 'updated_by_user',
        attributes: ['id', 'first_name', 'last_name']
      }
    ],
    order: [['department_id', 'ASC'], ['weekday', 'ASC']]
  });
};

export const getDepartmentOperatingHoursByDepartment = async (departmentId: number) => {
  const department = await DepartmentModel.findByPk(departmentId);
  if (!department) {
    throw new Error("Department not found");
  }

  return await DepartmentOperatingHoursModel.findAll({
    where: {
      department_id: departmentId,
      is_active: true
    },
    include: [
      {
        model: DepartmentModel,
        as: 'department',
        attributes: ['id', 'name']
      },
      {
        model: UserModel,
        as: 'created_by_user',
        attributes: ['id', 'first_name', 'last_name']
      },
      {
        model: UserModel,
        as: 'updated_by_user',
        attributes: ['id', 'first_name', 'last_name']
      }
    ],
    order: [['weekday', 'ASC']]
  });
};

export const getDepartmentOperatingHoursByWeekday = async (weekday: string) => {
  const validWeekdays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  if (!validWeekdays.includes(weekday)) {
    throw new Error("Invalid weekday");
  }

  return await DepartmentOperatingHoursModel.findAll({
    where: {
      weekday: weekday,
      is_active: true
    },
    include: [
      {
        model: DepartmentModel,
        as: 'department',
        attributes: ['id', 'name']
      },
      {
        model: UserModel,
        as: 'created_by_user',
        attributes: ['id', 'first_name', 'last_name']
      },
      {
        model: UserModel,
        as: 'updated_by_user',
        attributes: ['id', 'first_name', 'last_name']
      }
    ],
    order: [['department_id', 'ASC']]
  });
};
