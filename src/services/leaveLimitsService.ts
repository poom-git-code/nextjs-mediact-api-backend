import FacilityLeaveLimitsModel from "../models/LeaveLimitsModel";
import FacilityModel from "../models/FacilitiesModel";
import LeaveTypeModel from "../models/LeaveTypeModel";
import UserModel from "../models/UserModel";
import { Op } from "sequelize";

export const getAllLeaveLimits = async () => {
  return await FacilityLeaveLimitsModel.findAll({
    include: [
      {
        model: FacilityModel,
        as: "facility",
        attributes: ["id", "name"],
      },
      {
        model: LeaveTypeModel,
        as: "leave_type",
        attributes: ["id", "name", "description"],
      },
      {
        model: UserModel,
        as: "created_by_user",
        attributes: ["id", "username", "first_name", "last_name"],
      },
      {
        model: UserModel,
        as: "updated_by_user",
        attributes: ["id", "username", "first_name", "last_name"],
      },
    ],
    order: [["created_at", "DESC"]],
  });
};

export const getLeaveLimitById = async (id: number) => {
  const leaveLimit = await FacilityLeaveLimitsModel.findByPk(id, {
    include: [
      {
        model: FacilityModel,
        as: "facility",
        attributes: ["id", "name"],
      },
      {
        model: LeaveTypeModel,
        as: "leave_type",
        attributes: ["id", "name", "description"],
      },
      {
        model: UserModel,
        as: "created_by_user",
        attributes: ["id", "username", "first_name", "last_name"],
      },
      {
        model: UserModel,
        as: "updated_by_user",
        attributes: ["id", "username", "first_name", "last_name"],
      },
    ],
  });

  if (!leaveLimit) {
    throw new Error("Leave limit not found");
  }

  return leaveLimit;
};

export const getLeaveLimitsByFacility = async (facilityId: number) => {
  return await FacilityLeaveLimitsModel.findAll({
    where: { facility_id: facilityId },
    include: [
      {
        model: FacilityModel,
        as: "facility",
        attributes: ["id", "name"],
      },
      {
        model: LeaveTypeModel,
        as: "leave_type",
        attributes: ["id", "name", "description"],
      },
      {
        model: UserModel,
        as: "created_by_user",
        attributes: ["id", "username", "first_name", "last_name"],
      },
      {
        model: UserModel,
        as: "updated_by_user",
        attributes: ["id", "username", "first_name", "last_name"],
      },
    ],
    order: [["leave_type_id", "ASC"]],
  });
};

export const getLeaveLimitsByLeaveType = async (leaveTypeId: number) => {
  return await FacilityLeaveLimitsModel.findAll({
    where: { leave_type_id: leaveTypeId },
    include: [
      {
        model: FacilityModel,
        as: "facility",
        attributes: ["id", "name"],
      },
      {
        model: LeaveTypeModel,
        as: "leave_type",
        attributes: ["id", "name", "description"],
      },
      {
        model: UserModel,
        as: "created_by_user",
        attributes: ["id", "username", "first_name", "last_name"],
      },
      {
        model: UserModel,
        as: "updated_by_user",
        attributes: ["id", "username", "first_name", "last_name"],
      },
    ],
    order: [["facility_id", "ASC"]],
  });
};

export const createLeaveLimit = async (
  facility_id: number,
  leave_type_id: number,
  max_days: number,
  created_by?: number
) => {
  // Check if combination already exists
  const existingLimit = await FacilityLeaveLimitsModel.findOne({
    where: {
      facility_id,
      leave_type_id,
    },
  });

  if (existingLimit) {
    throw new Error(
      "Leave limit for this facility and leave type already exists"
    );
  }

  return await FacilityLeaveLimitsModel.create({
    facility_id,
    leave_type_id,
    max_days,
    created_by,
    created_at: new Date(),
    updated_at: new Date(),
  });
};

export const updateLeaveLimit = async (
  id: number,
  updateData: {
    facility_id?: number;
    leave_type_id?: number;
    max_days?: number;
    updated_by?: number;
  }
) => {
  const leaveLimit = await FacilityLeaveLimitsModel.findByPk(id);

  if (!leaveLimit) {
    throw new Error("Leave limit not found");
  }

  // If updating facility_id or leave_type_id, check for duplicates
  if (updateData.facility_id || updateData.leave_type_id) {
    const facilityId = updateData.facility_id || leaveLimit.facility_id;
    const leaveTypeId = updateData.leave_type_id || leaveLimit.leave_type_id;

    const existingLimit = await FacilityLeaveLimitsModel.findOne({
      where: {
        facility_id: facilityId,
        leave_type_id: leaveTypeId,
        id: { [Op.ne]: id }, // Exclude current record
      },
    });

    if (existingLimit) {
      throw new Error(
        "Leave limit for this facility and leave type already exists"
      );
    }
  }

  await leaveLimit.update({
    ...updateData,
    updated_at: new Date(),
  });

  return leaveLimit;
};

export const deleteLeaveLimit = async (id: number) => {
  const leaveLimit = await FacilityLeaveLimitsModel.findByPk(id);

  if (!leaveLimit) {
    throw new Error("Leave limit not found");
  }

  await leaveLimit.destroy();
  return { message: "Leave limit deleted successfully" };
};

export const getLeaveLimitByFacilityAndType = async (
  facilityId: number,
  leaveTypeId: number
) => {
  return await FacilityLeaveLimitsModel.findOne({
    where: {
      facility_id: facilityId,
      leave_type_id: leaveTypeId,
    },
    include: [
      {
        model: FacilityModel,
        as: "facility",
        attributes: ["id", "name"],
      },
      {
        model: LeaveTypeModel,
        as: "leave_type",
        attributes: ["id", "name", "description"],
      },
    ],
  });
};
