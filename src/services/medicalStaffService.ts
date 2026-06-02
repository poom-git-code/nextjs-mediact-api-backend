import UserRoleModel from "../models/UserRolesModel";
import UserModel from "../models/UserModel";
import RoleModel from "../models/RolesModel";
import ScheduleShiftModel from "../models/ScheduleShiftsModel";
import ShiftTypeModel from "../models/ShiftTypesModel";
import FacilityModel from "../models/FacilitiesModel";
import DepartmentModel from "../models/DepartmentModel";
import UserEmploymentModel from "../models/UserEmploymentsModel";
import SwapRequestModel from "../models/SwapRequestModel";
import { getUserAttributes, decryptAndCleanUserData } from "../utils/encryptedFieldMapping";
import { PipedaUserDataHandler } from "../middleware/pipedaUserDataHandler";
import { Op } from "sequelize";

// Function to get all user that same role
export const getUsersByRoleAll = async (roleName: string) => {
  const role = await RoleModel.findOne({ where: { name: roleName } });
  if (!role) throw new Error(`Role ${roleName} not found`);

  const users = await UserModel.findAll({
    attributes: getUserAttributes(),
    include: [
      {
        model: UserRoleModel,
        as: "user_role",
        where: { role_id: role.id },
        required: true,
      },
    ],
  });

  // Decrypt user data
  const processedUsers = users.map((user: any) => {
    const userData = user.get({ plain: true });
    return decryptAndCleanUserData(userData);
  });

  return processedUsers;
};

// Function to get nurse that same facilities & departments
// export const getNurseByFacilityAndDepartment = async (
//   facilityId: number,
//   departmentId: number
// ) => {
//   return await UserModel.findAll({
//     include: [
//       {
//         model: UserRoleModel,
//         as: "user_role",
//         where: { role_id: RoleModel.find({ name: "Nurse" }) },
//         required: true,
//       },
//     ],
//     where: {
//       facility_id: facilityId,
//       department_id: departmentId,
//     },
//   });
// };

export const getUsersWithRoleAndSchedules = async (
  userId: number,
  scheduleId: number
) => {
  // Fetch the role and facility/department of the given user
  const user = await UserModel.findOne({
    where: { id: userId },
    include: [
      {
        model: UserRoleModel,
        as: "user_role",
        where: { is_active: true },
        required: true,
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
        where: { is_active: true },
        required: true,
        include: [
          {
            model: FacilityModel,
            as: "facility",
            attributes: ["id", "name"],
          },
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
    throw new Error("User not found");
  }

  // Check if role_id matches from the user_roles table
  const userRole = await UserRoleModel.findOne({
    where: { user_id: userId, is_active: true },
    attributes: ["role_id"],
  });

  if (!userRole) {
    throw new Error("Role not found for the user");
  }

  const userRoleId = userRole.role_id;
  // console.log("userRoleId:", userRoleId);

  // Check facility_id and department_id from the user_employments table
  const userEmployment = await UserEmploymentModel.findOne({
    where: { user_id: userId, is_active: true },
    attributes: ["facility_id", "department_id"],
  });

  if (!userEmployment) {
    throw new Error("Employment details not found for the user");
  }

  const facilityId = userEmployment.facility_id;
  const departmentId = userEmployment.department_id;
  // console.log("facilityId:", facilityId);
  // console.log("departmentId:", departmentId);

  if (!userRoleId) {
    throw new Error("Role ID not found for the user");
  }

  if (!facilityId || !departmentId) {
    throw new Error("Facility or Department not found for the user");
  }

  // Fetch the schedule to get the date
  const schedule = await ScheduleShiftModel.findOne({
    where: { id: scheduleId },
    attributes: ["shift_date"],
  });

  if (!schedule) {
    throw new Error("Schedule not found for the given schedule ID");
  }

  // const shiftDate = "2025-08-25";
  const shiftDate = schedule.shift_date;
  // console.log("shiftDate:", shiftDate);

  // Fetch users with the same role, facility, and department
  const users = await UserModel.findAll({
    attributes: getUserAttributes(),
    include: [
      {
        model: UserRoleModel,
        as: "user_role",
        where: { role_id: userRoleId, is_active: true },
        required: true,
      },
      {
        model: UserEmploymentModel,
        as: "user_employment",
        where: {
          facility_id: facilityId,
          department_id: departmentId,
          is_active: true,
        },
        required: true,
      },
    ],
  });

  // console.log("users:", users);

  if (!users || users.length === 0) {
    throw new Error(
      "No users found with the specified role, facility, and department"
    );
  }

  // Attach schedules filtered by the shift date
  const schedulesByDate = await ScheduleShiftModel.findAll({
    where: { shift_date: shiftDate },
    include: [
      {
        model: ShiftTypeModel,
        as: "shift_type",
        attributes: [
          "id",
          "name",
          "start_time",
          "end_time",
          "roles_allowed",
          "color_code",
          "short_name",
          "total_hours",
          "normal_hours",
          "ot_hours",
        ],
      },
    ],
  });

  // console.log("schedulesByDate:", schedulesByDate);

  const usersWithSchedules = users.map((user) => {
    // Decrypt user data
    const userData = user.get({ plain: true });
    const decryptedUser = decryptAndCleanUserData(userData);
    
    const filteredSchedules = schedulesByDate.filter(
      (schedule) => schedule.dataValues.employee_id === user.id
    );

    // console.log("Filtered schedules for user:", user.id, filteredSchedules);

    return { user: decryptedUser, schedules: filteredSchedules };
  });

  if (!usersWithSchedules || usersWithSchedules.length === 0) {
    throw new Error("No schedules found for the given users");
  }

  // Filter out the userId from the results
  const filteredUsersWithSchedules = usersWithSchedules.filter(
    (userWithSchedule) => userWithSchedule.user.id !== userId
  );

  // // Log user IDs used in filtering schedules
  // console.log(
  //   "Filtered user IDs:",
  //   usersWithSchedules.map((userWithSchedule) => userWithSchedule.user.id)
  // );

  // return usersWithSchedules;
  return filteredUsersWithSchedules;
};

export const getUserForSwap = async (userId: number, date: string) => {
  
  const userEmployment = await UserEmploymentModel.findOne({
    where: { 
      user_id: userId,
      is_active: true 
    },
    attributes: ["department_id", "facility_id"],
  });

  if (!userEmployment) {
    throw new Error("User employment not found");
  }

  const departmentId = userEmployment.department_id;
  const facilityId = userEmployment.facility_id;

  if (!departmentId) {
    throw new Error("Department not found for the user");
  }

  const usersInDepartment = await UserEmploymentModel.findAll({
    where: {
      department_id: departmentId,
      facility_id: facilityId,
      is_active: true,
      user_id: { [Op.ne]: userId },
      [Op.or]: [
        { is_part_time: false },
        { is_part_time: null }
      ]
    },
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: getUserAttributes(),
        include: [
          {
            model: UserRoleModel,
            as: "user_role",
            where: { is_active: true },
            required: false,
            include: [
              {
                model: RoleModel,
                as: "role",
                attributes: ["id", "name"],
              },
            ],
          },
        ],
      },
    ],
  });

  if (!usersInDepartment || usersInDepartment.length === 0) {
    return [];
  }

  // Get user IDs
  const userIds = usersInDepartment.map((emp: any) => emp.user_id);

  // Get schedule IDs that are in pending or approved swap requests
  const swapRequests = await SwapRequestModel.findAll({
    where: {
      status: { [Op.in]: ["pending", "approved"] },
      [Op.or]: [
        { shift_id: { [Op.ne]: null } },
        { swap_shift_id: { [Op.ne]: null } }
      ]
    },
    attributes: ["shift_id", "swap_shift_id"],
  });

  const excludedShiftIds = new Set<number>();
  swapRequests.forEach((req) => {
    if (req.shift_id) excludedShiftIds.add(req.shift_id);
    if (req.swap_shift_id) excludedShiftIds.add(req.swap_shift_id);
  });

  // Get schedules for these users on the specified date
  const schedules = await ScheduleShiftModel.findAll({
    where: {
      employee_id: { [Op.in]: userIds },
      shift_date: date,
      actual_check_in: null,
      ...(excludedShiftIds.size > 0 ? { id: { [Op.notIn]: Array.from(excludedShiftIds) } } : {})
    },
    include: [
      {
        model: ShiftTypeModel,
        as: "shift_type",
        attributes: [
          "id",
          "name",
          "start_time",
          "end_time",
          "color_code",
          "short_name",
          "total_hours",
          "normal_hours",
          "ot_hours",
        ],
        where: {
          short_name: {
            [Op.notIn]: ["X", "V", "TRN"]
          }
        },
        required: true,
      },
      {
        model: FacilityModel,
        as: "facility",
        attributes: ["id", "name"],
      },
      {
        model: DepartmentModel,
        as: "department",
        attributes: ["id", "name"],
      },
    ],
  });

  // Map schedules by employee_id
  const schedulesMap = new Map<number, any[]>();
  schedules.forEach((schedule) => {
    const empId = schedule.employee_id;
    if (!schedulesMap.has(empId)) {
      schedulesMap.set(empId, []);
    }
    schedulesMap.get(empId)!.push(schedule.toJSON());
  });

  // Build result with users who have schedules on that date
  const result = usersInDepartment
    .map((emp: any) => {
      const empData = emp.get({ plain: true });
      const userSchedules = schedulesMap.get(emp.user_id) || [];
      
      if (userSchedules.length === 0) {
        return null; // Skip users without schedules on this date
      }

      // Decrypt user data
      const decryptedUser = decryptAndCleanUserData(empData.user);

      return {
        user: decryptedUser,
        schedules: userSchedules,
      };
    })
    .filter((item) => item !== null); // Remove null entries

  return result;
};

export const getUserForTransfer = async (userId: number, scheduleId: number) => {
  // Get the schedule to transfer
  const targetSchedule = await ScheduleShiftModel.findOne({
    where: { id: scheduleId },
    include: [
      {
        model: ShiftTypeModel,
        as: "shift_type",
        attributes: ["id", "name", "start_time", "end_time", "short_name"],
        required: true,
      },
    ],
    attributes: ["id", "shift_date", "employee_id", "shift_type_id"],
  });

  if (!targetSchedule) {
    throw new Error("Schedule not found");
  }

  const targetDate = targetSchedule.shift_date;
  const targetShiftType = (targetSchedule as any).shift_type;
  const targetStartTime = targetShiftType.start_time;
  const targetEndTime = targetShiftType.end_time;

  // Get user employment info (must not be part-time or job applicant)
  const userEmployment = await UserEmploymentModel.findOne({
    where: { 
      user_id: userId,
      is_active: true,
      [Op.or]: [
        { is_part_time: false },
        { is_part_time: null }
      ],
      [Op.and]: [
        {
          [Op.or]: [
            { is_job_applicant: false },
            { is_job_applicant: null }
          ]
        }
      ]
    },
    attributes: ["department_id", "facility_id"],
  });

  if (!userEmployment) {
    throw new Error("User employment not found or user is part-time/job applicant");
  }

  const departmentId = userEmployment.department_id;
  const facilityId = userEmployment.facility_id;

  if (!departmentId) {
    throw new Error("Department not found for the user");
  }

  // Get all users in the same department (excluding the requesting user)
  const usersInDepartment = await UserEmploymentModel.findAll({
    where: {
      department_id: departmentId,
      facility_id: facilityId,
      is_active: true,
      user_id: { [Op.ne]: userId },
      [Op.or]: [
        { is_part_time: false },
        { is_part_time: null }
      ],
      [Op.and]: [
        {
          [Op.or]: [
            { is_job_applicant: false },
            { is_job_applicant: null }
          ]
        }
      ]
    },
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: getUserAttributes(),
        include: [
          {
            model: UserRoleModel,
            as: "user_role",
            where: { is_active: true },
            required: false,
            include: [
              {
                model: RoleModel,
                as: "role",
                attributes: ["id", "name"],
              },
            ],
          },
        ],
      },
    ],
  });

  if (!usersInDepartment || usersInDepartment.length === 0) {
    return [];
  }

  // Get user IDs
  const userIds = usersInDepartment.map((emp: any) => emp.user_id);

  // Get all schedules for these users on the target date
  const userSchedules = await ScheduleShiftModel.findAll({
    where: {
      employee_id: { [Op.in]: userIds },
      shift_date: targetDate,
    },
    include: [
      {
        model: ShiftTypeModel,
        as: "shift_type",
        attributes: ["id", "name", "start_time", "end_time", "short_name"],
        required: true,
      },
    ],
    attributes: ["id", "employee_id", "shift_date", "shift_type_id"],
  });

  // Helper function to check if two time ranges overlap
  const isTimeOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
    // Convert time strings to comparable format (HH:MM:SS)
    const s1 = start1.substring(0, 8);
    const e1 = end1.substring(0, 8);
    const s2 = start2.substring(0, 8);
    const e2 = end2.substring(0, 8);
    
    // Overlap occurs if: start1 < end2 AND end1 > start2
    return s1 < e2 && e1 > s2;
  };

  // Map schedules by employee_id
  const schedulesMap = new Map<number, any[]>();
  userSchedules.forEach((schedule) => {
    const empId = schedule.employee_id;
    if (!schedulesMap.has(empId)) {
      schedulesMap.set(empId, []);
    }
    schedulesMap.get(empId)!.push(schedule);
  });

  // Filter users who meet the criteria
  const eligibleUsers = usersInDepartment
    .filter((emp: any) => {
      const empId = emp.user_id;
      const empSchedules = schedulesMap.get(empId) || [];

      // Case 1: User has no schedule on this date - eligible
      if (empSchedules.length === 0) {
        return true;
      }

      // Case 2: User has shift type "X" (off day) - eligible
      const hasShiftX = empSchedules.some((schedule: any) => 
        schedule.shift_type.short_name === "X"
      );
      if (hasShiftX) {
        return true;
      }

      // Case 3: User has schedules but none overlap with target time
      const hasOverlap = empSchedules.some((schedule: any) => {
        const shiftType = schedule.shift_type;
        // Skip X, V shifts in overlap check
        if (["X", "V"].includes(shiftType.short_name)) {
          return false;
        }
        return isTimeOverlap(
          targetStartTime,
          targetEndTime,
          shiftType.start_time,
          shiftType.end_time
        );
      });

      return !hasOverlap; // Eligible if no overlap
    })
    .map((emp: any) => {
      const empData = emp.get({ plain: true });
      // Decrypt user data
      return decryptAndCleanUserData(empData.user);
    });

  return eligibleUsers;
};
