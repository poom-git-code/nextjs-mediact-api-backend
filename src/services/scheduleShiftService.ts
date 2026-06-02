import ScheduleShiftModel from "../models/ScheduleShiftsModel";
import { getUserAttributes, getBasicUserAttributes, getUserWithUsernameAttributes, decryptAndCleanUserData } from "../utils/encryptedFieldMapping";
import UserModel from "../models/UserModel";
import ShiftTypeModel from "../models/ShiftTypesModel";
import FacilityModel from "../models/FacilitiesModel";
import DepartmentModel from "../models/DepartmentModel";
import UserEmploymentModel from "../models/UserEmploymentsModel";
import UserRoleModel from "../models/UserRolesModel";
import RoleModel from "../models/RolesModel";
import ScheduleShiftLogsModel from "../models/ScheduleShiftLogsModel";
import ScheduleShiftLogTypesModel from "../models/ScheduleShiftLogTypesModel";
import WorkTypeModel from "../models/WorkTypeModel";
import SwapRequestModel from "../models/SwapRequestModel";
import GiveShiftRequestModel from "../models/GiveShiftRequestModel";
import { Sequelize, Op } from "sequelize";

export const createScheduleShift = async (data: any) => {
  // Set init_employee_id to employee_id if not provided
  if (data.employee_id && !data.init_employee_id) {
    data.init_employee_id = data.employee_id;
  }
  return await ScheduleShiftModel.create(data);
};

export const updateScheduleShift = async (
  id: number,
  updates: Partial<ScheduleShiftModel>
) => {
  const shift = await ScheduleShiftModel.findByPk(id);
  if (!shift) {
    throw new Error("Schedule Shift not found");
  }
  return await shift.update(updates);
};

export const deleteScheduleShift = async (id: number) => {
  const shift = await ScheduleShiftModel.findByPk(id);
  if (!shift) {
    throw new Error("Schedule Shift not found");
  }
  return await shift.destroy();
};

export const getScheduleShiftById = async (id: number) => {
  const shift = await ScheduleShiftModel.findByPk(id);
  if (!shift) {
    throw new Error("Schedule Shift not found");
  }
  return shift;
};

export const getScheduleShiftByFacility = async (userId: number) => {
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

  if (!user_employment || !user_employment[0].facility_id) {
    throw new Error("Facility ID not found for the user");
  }

  const facilityId = user_employment[0].facility_id;
  // console.log("facilityId: ", facilityId);

  const shiftTypes = await ScheduleShiftModel.findAll({
    where: { facility_id: facilityId }, // ค้นหาโดย facility_id
    include: [
      {
        model: UserModel,
        as: "employee",
        attributes: getUserAttributes(),
        include: [
          {
            model: UserRoleModel,
            as: "user_role",
            // where: { is_active: true },
            attributes: ["id", "assigned_at"],
            required: false,
            include: [
              {
                model: RoleModel,
                as: "role",
                // where: { is_active: true },
                attributes: ["id", "name"],
                required: false,
              },
            ],
          },
        ],
      },
      {
        model: ShiftTypeModel,
        as: "shift_type",
        attributes: ["id", "name", "start_time", "end_time", "color_code", "short_name"],
      },
      {
        model: FacilityModel,
        as: "facility",
        attributes: ["id", "name"],
        // where: { is_active: true },
        required: false,
      },
      {
        model: DepartmentModel,
        as: "department",
        attributes: ["id", "name"],
        // where: { is_active: true },
        required: false,
      },
    ],
  });

  if (!shiftTypes || shiftTypes.length === 0) {
    throw new Error("No shift type found for the given facility");
  }

  // Decrypt user data
  const processedShifts = shiftTypes.map((shift: any) => {
    const shiftData = shift.get({ plain: true });
    
    if (shiftData.employee) {
      shiftData.employee = decryptAndCleanUserData(shiftData.employee);
    }

    return shiftData;
  });

  return processedShifts;
};

export const getAllScheduleShifts = async () => {
  return await ScheduleShiftModel.findAll();
};

export const getAllScheduleShiftsByScheduleMasterId = async (scheduleMasterId: number) => {
  return await ScheduleShiftModel.findAll({
    where: { schedule_master_id: scheduleMasterId },
  });
};

export const getSchedulesByUserId = async (userId: number) => {
  const schedules = await ScheduleShiftModel.findAll({
    where: { employee_id: userId },
    include: [
      {
        model: UserModel,
        as: "employee",
        attributes: getBasicUserAttributes(),
      },
      {
        model: ShiftTypeModel,
        as: "shift_type",
        attributes: ["id", "name", "start_time", "end_time", "color_code", "short_name"],
      },
      {
        model: FacilityModel,
        as: "facility",
        attributes: ["id", "name", "latitude", "longitude", "address", "abbreviation", "is_active"],
      },
      {
        model: DepartmentModel,
        as: "department",
        attributes: ["id", "name"],
      },
    ],
    attributes: [
      "id",
      "schedule_master_id",
      "shift_date",
      "status_id",
      "init_employee_id",
      "remarks",
      "is_job_broadcast",
      "is_active",
      "created_at",
      "updated_at",
    ],
  });

  // all log of user
  const logs = await ScheduleShiftLogsModel.findAll({
    where: { user_id: userId },
    include: [
      {
        model: ScheduleShiftLogTypesModel,
        as: "log_type",
        attributes: ["id", "name"],
      },
      {
        model: WorkTypeModel,
        as: "work_type",
        attributes: ["id", "name"],
      },
    ],
    attributes: ["schedule_shift_id", "log_type_id", "work_type_id", "log_timestamp"],
  });

  // map lookup logs by schedule_shift_id
  const logsMap = new Map<number, any[]>();
  logs.forEach((log) => {
    const shiftId = log.schedule_shift_id;
    if (!logsMap.has(shiftId)) {
      logsMap.set(shiftId, []);
    }
    logsMap.get(shiftId)!.push(log);
  });

  const schedulesWithStatus = schedules.map((schedule) => {
    const shiftLogs = logsMap.get(schedule.id) || [];
    
  let shift_status = "no_action";
  let latest_log = null;
  let onduty = null;
  let checkout = null;
  let summary: { time: string | null } = { time: null };
  let work_type: Array<{ id: number; name: string }> = [];

    if (shiftLogs.length > 0) {
      // sort logs by time (ล่าสุดก่อน)
      const sortedLogs = shiftLogs.sort((a, b) => 
        new Date(b.log_timestamp).getTime() - new Date(a.log_timestamp).getTime()
      );
      
      latest_log = sortedLogs[0];
      
      // onduty & checkout logs
      const ondutylLog = shiftLogs.find(log => log.log_type_id === 1);
      const checkoutLog = shiftLogs.find(log => log.log_type_id === 2);

      // work_type list 
      const wtMap = new Map<number, { id: number; name: string }>();
      shiftLogs.forEach((l) => {
        const wt = (l as any).work_type;
        if (wt && wt.id && !wtMap.has(wt.id)) {
          wtMap.set(wt.id, { id: wt.id, name: wt.name });
        }
      });
      work_type = Array.from(wtMap.values());
      
      // onduty
      if (ondutylLog) {
        onduty = {
          date: new Date(ondutylLog.log_timestamp).toISOString().split('T')[0],
          time: new Date(ondutylLog.log_timestamp).toTimeString().split(' ')[0]
        };
      }
      
      // checkout
      if (checkoutLog) {
        checkout = {
          date: new Date(checkoutLog.log_timestamp).toISOString().split('T')[0],
          time: new Date(checkoutLog.log_timestamp).toTimeString().split(' ')[0]
        };
      }
      
      // summary time
      if (ondutylLog && checkoutLog) {
        const ondutylTime = new Date(ondutylLog.log_timestamp);
        const checkoutTime = new Date(checkoutLog.log_timestamp);
        const diffMs = checkoutTime.getTime() - ondutylTime.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        summary.time = `${diffHours}:${diffMinutes.toString().padStart(2, '0')}`;
      }
      
      
      switch (latest_log.log_type_id) {
        case 1:
          shift_status = "on_duty";
          break;
        case 2:
          shift_status = "checked_out";
          break;
        default:
          shift_status = "other_action";
      }
    }

    return {
      ...schedule.toJSON(),
      shift_status,
      onduty,
      checkout,
      summary,
  work_type,
      latest_log: latest_log ? {
        log_type_id: latest_log.log_type_id,
        log_type_name: latest_log.log_type?.name,
        log_timestamp: latest_log.log_timestamp,
      } : null,
      // total_logs: shiftLogs.length,
    };
  });

  // Process PIPEDA decryption for schedules
  const processedSchedules = schedulesWithStatus.map((schedule: any) => {
    // Decrypt employee data
    if (schedule.employee) {
      schedule.employee = decryptAndCleanUserData(schedule.employee);
    }

    return schedule;
  });

  return processedSchedules;
};

export const getSchedulesByDate = async (userId: number, date: string) => {

  const swapRequests = await SwapRequestModel.findAll({
    where: {
      [Op.or]: [
        // Case 1: target_approve_status = 'PENDING' AND status = 'pending'
        {
          target_approve_status: "PENDING",
          status: "pending"
        },
        // Case 2: target_approve_status = 'APPROVED' AND status = 'pending'
        {
          target_approve_status: "APPROVED",
          status: "pending"
        },
        // Case 3: target_approve_status = 'APPROVED' AND status = 'approved'
        {
          target_approve_status: "APPROVED",
          status: "approved"
        }
      ],
    },
    attributes: ["shift_id", "swap_shift_id"],
  });

  const excludedShiftIds = new Set<number>();
  swapRequests.forEach((req) => {
    if (req.shift_id) excludedShiftIds.add(req.shift_id);
    if (req.swap_shift_id) excludedShiftIds.add(req.swap_shift_id);
  });

  const schedules = await ScheduleShiftModel.findAll({
    where: { 
      employee_id: userId,
      shift_date: date,
      is_job_broadcast: false,
      actual_check_in: null,
      ...(excludedShiftIds.size > 0 ? { id: { [Op.notIn]: Array.from(excludedShiftIds) } } : {})
    },
    include: [
      {
        model: UserModel,
        as: "employee",
        attributes: getBasicUserAttributes(),
      },
      {
        model: ShiftTypeModel,
        as: "shift_type",
        attributes: ["id", "name", "start_time", "end_time", "color_code", "short_name"],
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
        attributes: ["id", "name", "latitude", "longitude", "address", "abbreviation", "is_active"],
      },
      {
        model: DepartmentModel,
        as: "department",
        attributes: ["id", "name"],
      },
    ],
    attributes: [
      "id",
      "schedule_master_id",
      "shift_date",
      "status_id",
      "init_employee_id",
      "remarks",
      "is_job_broadcast",
      "is_active",
      "created_at",
      "updated_at",
    ],
  });

  // Get logs for this user on this date
  const logs = await ScheduleShiftLogsModel.findAll({
    where: { user_id: userId },
    include: [
      {
        model: ScheduleShiftLogTypesModel,
        as: "log_type",
        attributes: ["id", "name"],
      },
      {
        model: WorkTypeModel,
        as: "work_type",
        attributes: ["id", "name"],
      },
    ],
    attributes: ["schedule_shift_id", "log_type_id", "work_type_id", "log_timestamp"],
  });

  // Map lookup logs by schedule_shift_id
  const logsMap = new Map<number, any[]>();
  logs.forEach((log) => {
    const shiftId = log.schedule_shift_id;
    if (!logsMap.has(shiftId)) {
      logsMap.set(shiftId, []);
    }
    logsMap.get(shiftId)!.push(log);
  });

  const schedulesWithStatus = schedules.map((schedule) => {
    const shiftLogs = logsMap.get(schedule.id) || [];
    
    let shift_status = "no_action";
    let latest_log = null;
    let onduty = null;
    let checkout = null;
    let summary: { time: string | null } = { time: null };
    let work_type: Array<{ id: number; name: string }> = [];

    if (shiftLogs.length > 0) {
      const sortedLogs = shiftLogs.sort((a, b) => 
        new Date(b.log_timestamp).getTime() - new Date(a.log_timestamp).getTime()
      );
      
      latest_log = sortedLogs[0];
      
      const ondutylLog = shiftLogs.find(log => log.log_type_id === 1);
      const checkoutLog = shiftLogs.find(log => log.log_type_id === 2);

      const wtMap = new Map<number, { id: number; name: string }>();
      shiftLogs.forEach((l) => {
        const wt = (l as any).work_type;
        if (wt && wt.id && !wtMap.has(wt.id)) {
          wtMap.set(wt.id, { id: wt.id, name: wt.name });
        }
      });
      work_type = Array.from(wtMap.values());
      
      if (ondutylLog) {
        onduty = {
          date: new Date(ondutylLog.log_timestamp).toISOString().split('T')[0],
          time: new Date(ondutylLog.log_timestamp).toTimeString().split(' ')[0]
        };
      }
      
      if (checkoutLog) {
        checkout = {
          date: new Date(checkoutLog.log_timestamp).toISOString().split('T')[0],
          time: new Date(checkoutLog.log_timestamp).toTimeString().split(' ')[0]
        };
      }
      
      if (ondutylLog && checkoutLog) {
        const ondutylTime = new Date(ondutylLog.log_timestamp);
        const checkoutTime = new Date(checkoutLog.log_timestamp);
        const diffMs = checkoutTime.getTime() - ondutylTime.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        summary.time = `${diffHours}:${diffMinutes.toString().padStart(2, '0')}`;
      }
      
      switch (latest_log.log_type_id) {
        case 1:
          shift_status = "on_duty";
          break;
        case 2:
          shift_status = "checked_out";
          break;
        default:
          shift_status = "other_action";
      }
    }

    return {
      ...schedule.toJSON(),
      shift_status,
      onduty,
      checkout,
      summary,
      work_type,
      latest_log: latest_log ? {
        log_type_id: latest_log.log_type_id,
        log_type_name: latest_log.log_type?.name,
        log_timestamp: latest_log.log_timestamp,
      } : null,
    };
  });

  const processedSchedules = schedulesWithStatus.map((schedule: any) => {
    if (schedule.employee) {
      schedule.employee = decryptAndCleanUserData(schedule.employee);
    }
    return schedule;
  });

  return processedSchedules;
};

export const getSchedulesByUserIdAndDate = async (userId: number, date: string) => {
  const schedules = await ScheduleShiftModel.findAll({
    where: { 
      employee_id: userId,
      shift_date: date,
      is_job_broadcast: false
    },
    include: [
      {
        model: UserModel,
        as: "employee",
        attributes: getBasicUserAttributes(),
      },
      {
        model: ShiftTypeModel,
        as: "shift_type",
        attributes: ["id", "name", "start_time", "end_time", "color_code", "short_name"],
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
        attributes: ["id", "name", "latitude", "longitude", "address", "abbreviation", "is_active"],
      },
      {
        model: DepartmentModel,
        as: "department",
        attributes: ["id", "name"],
      },
    ],
    attributes: [
      "id",
      "schedule_master_id",
      "shift_date",
      "status_id",
      "init_employee_id",
      "remarks",
      "is_job_broadcast",
      "is_active",
      "created_at",
      "updated_at",
    ],
  });

  // Get logs for this user
  const logs = await ScheduleShiftLogsModel.findAll({
    where: { user_id: userId },
    include: [
      {
        model: ScheduleShiftLogTypesModel,
        as: "log_type",
        attributes: ["id", "name"],
      },
      {
        model: WorkTypeModel,
        as: "work_type",
        attributes: ["id", "name"],
      },
    ],
    attributes: ["schedule_shift_id", "log_type_id", "work_type_id", "log_timestamp"],
  });

  // Map lookup logs by schedule_shift_id
  const logsMap = new Map<number, any[]>();
  logs.forEach((log) => {
    const shiftId = log.schedule_shift_id;
    if (!logsMap.has(shiftId)) {
      logsMap.set(shiftId, []);
    }
    logsMap.get(shiftId)!.push(log);
  });

  const schedulesWithStatus = schedules.map((schedule) => {
    const shiftLogs = logsMap.get(schedule.id) || [];
    
    let shift_status = "no_action";
    let latest_log = null;
    let onduty = null;
    let checkout = null;
    let summary: { time: string | null } = { time: null };
    let work_type: Array<{ id: number; name: string }> = [];

    if (shiftLogs.length > 0) {
      const sortedLogs = shiftLogs.sort((a, b) => 
        new Date(b.log_timestamp).getTime() - new Date(a.log_timestamp).getTime()
      );
      
      latest_log = sortedLogs[0];
      
      const ondutylLog = shiftLogs.find(log => log.log_type_id === 1);
      const checkoutLog = shiftLogs.find(log => log.log_type_id === 2);

      const wtMap = new Map<number, { id: number; name: string }>();
      shiftLogs.forEach((l) => {
        const wt = (l as any).work_type;
        if (wt && wt.id && !wtMap.has(wt.id)) {
          wtMap.set(wt.id, { id: wt.id, name: wt.name });
        }
      });
      work_type = Array.from(wtMap.values());
      
      if (ondutylLog) {
        onduty = {
          date: new Date(ondutylLog.log_timestamp).toISOString().split('T')[0],
          time: new Date(ondutylLog.log_timestamp).toTimeString().split(' ')[0]
        };
      }
      
      if (checkoutLog) {
        checkout = {
          date: new Date(checkoutLog.log_timestamp).toISOString().split('T')[0],
          time: new Date(checkoutLog.log_timestamp).toTimeString().split(' ')[0]
        };
      }
      
      if (ondutylLog && checkoutLog) {
        const ondutylTime = new Date(ondutylLog.log_timestamp);
        const checkoutTime = new Date(checkoutLog.log_timestamp);
        const diffMs = checkoutTime.getTime() - ondutylTime.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        summary.time = `${diffHours}:${diffMinutes.toString().padStart(2, '0')}`;
      }
      
      switch (latest_log.log_type_id) {
        case 1:
          shift_status = "on_duty";
          break;
        case 2:
          shift_status = "checked_out";
          break;
        default:
          shift_status = "other_action";
      }
    }

    return {
      ...schedule.toJSON(),
      shift_status,
      onduty,
      checkout,
      summary,
      work_type,
      latest_log: latest_log ? {
        log_type_id: latest_log.log_type_id,
        log_type_name: latest_log.log_type?.name,
        log_timestamp: latest_log.log_timestamp,
      } : null,
    };
  });

  const processedSchedules = schedulesWithStatus.map((schedule: any) => {
    if (schedule.employee) {
      schedule.employee = decryptAndCleanUserData(schedule.employee);
    }
    return schedule;
  });

  return processedSchedules;
};

export const getSchedulesByUserIdAndDateForTransferShift = async (userId: number, date: string) => {
  const giveShiftRequests = await GiveShiftRequestModel.findAll({
    // where: {
    //   status: { [Op.in]: ["PENDING", "APPROVED"] },
    //   shift_id: { [Op.ne]: null }
    // },
     where: {
      [Op.or]: [
        // Case 1: 
        {
          target_approve_status: "PENDING",
          status: "PENDING"
        },
        // Case 2: 
        {
          target_approve_status: "APPROVED",
          status: "PENDING"
        },
        // Case 3: 
        {
          target_approve_status: "APPROVED",
          status: "APPROVED"
        }
      ],
    },
    attributes: ["shift_id"],
  });

  const excludedShiftIds = new Set<number>();
  giveShiftRequests.forEach((req) => {
    if (req.shift_id) excludedShiftIds.add(req.shift_id);
  });

  // Also exclude shifts that are part of pending/approved swap requests
  const swapRequests = await SwapRequestModel.findAll({
    where: {
      [Op.or]: [
        // Case 1: target_approve_status = 'PENDING' AND status = 'pending'
        {
          target_approve_status: "PENDING",
          status: "pending"
        },
        // Case 2: target_approve_status = 'APPROVED' AND status = 'pending'
        {
          target_approve_status: "APPROVED",
          status: "pending"
        },
        // Case 3: target_approve_status = 'APPROVED' AND status = 'approved'
        {
          target_approve_status: "APPROVED",
          status: "approved"
        }
      ],
    },
    attributes: ["shift_id", "swap_shift_id"],
  });

  swapRequests.forEach((req) => {
    if (req.shift_id) excludedShiftIds.add(req.shift_id);
    if (req.swap_shift_id) excludedShiftIds.add(req.swap_shift_id);
  });

  const schedules = await ScheduleShiftModel.findAll({
    where: { 
      employee_id: userId,
      shift_date: date,
      is_job_broadcast: false,
      actual_check_in: null,
      ...(excludedShiftIds.size > 0 ? { id: { [Op.notIn]: Array.from(excludedShiftIds) } } : {})
    },
    include: [
      {
        model: UserModel,
        as: "employee",
        attributes: getBasicUserAttributes(),
      },
      {
        model: ShiftTypeModel,
        as: "shift_type",
        attributes: ["id", "name", "start_time", "end_time", "color_code", "short_name"],
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
        attributes: ["id", "name", "latitude", "longitude", "address", "abbreviation", "is_active"],
      },
      {
        model: DepartmentModel,
        as: "department",
        attributes: ["id", "name"],
      },
    ],
    attributes: [
      "id",
      "schedule_master_id",
      "shift_date",
      "status_id",
      "init_employee_id",
      "remarks",
      "is_job_broadcast",
      "is_active",
      "created_at",
      "updated_at",
    ],
  });

  // Get logs for this user
  const logs = await ScheduleShiftLogsModel.findAll({
    where: { user_id: userId },
    include: [
      {
        model: ScheduleShiftLogTypesModel,
        as: "log_type",
        attributes: ["id", "name"],
      },
      {
        model: WorkTypeModel,
        as: "work_type",
        attributes: ["id", "name"],
      },
    ],
    attributes: ["schedule_shift_id", "log_type_id", "work_type_id", "log_timestamp"],
  });

  // Map lookup logs by schedule_shift_id
  const logsMap = new Map<number, any[]>();
  logs.forEach((log) => {
    const shiftId = log.schedule_shift_id;
    if (!logsMap.has(shiftId)) {
      logsMap.set(shiftId, []);
    }
    logsMap.get(shiftId)!.push(log);
  });

  const schedulesWithStatus = schedules.map((schedule) => {
    const shiftLogs = logsMap.get(schedule.id) || [];
    
    let shift_status = "no_action";
    let latest_log = null;
    let onduty = null;
    let checkout = null;
    let summary: { time: string | null } = { time: null };
    let work_type: Array<{ id: number; name: string }> = [];

    if (shiftLogs.length > 0) {
      const sortedLogs = shiftLogs.sort((a, b) => 
        new Date(b.log_timestamp).getTime() - new Date(a.log_timestamp).getTime()
      );
      
      latest_log = sortedLogs[0];
      
      const ondutylLog = shiftLogs.find(log => log.log_type_id === 1);
      const checkoutLog = shiftLogs.find(log => log.log_type_id === 2);

      const wtMap = new Map<number, { id: number; name: string }>();
      shiftLogs.forEach((l) => {
        const wt = (l as any).work_type;
        if (wt && wt.id && !wtMap.has(wt.id)) {
          wtMap.set(wt.id, { id: wt.id, name: wt.name });
        }
      });
      work_type = Array.from(wtMap.values());
      
      if (ondutylLog) {
        onduty = {
          date: new Date(ondutylLog.log_timestamp).toISOString().split('T')[0],
          time: new Date(ondutylLog.log_timestamp).toTimeString().split(' ')[0]
        };
      }
      
      if (checkoutLog) {
        checkout = {
          date: new Date(checkoutLog.log_timestamp).toISOString().split('T')[0],
          time: new Date(checkoutLog.log_timestamp).toTimeString().split(' ')[0]
        };
      }
      
      if (ondutylLog && checkoutLog) {
        const ondutylTime = new Date(ondutylLog.log_timestamp);
        const checkoutTime = new Date(checkoutLog.log_timestamp);
        const diffMs = checkoutTime.getTime() - ondutylTime.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        summary.time = `${diffHours}:${diffMinutes.toString().padStart(2, '0')}`;
      }
      
      switch (latest_log.log_type_id) {
        case 1:
          shift_status = "on_duty";
          break;
        case 2:
          shift_status = "checked_out";
          break;
        default:
          shift_status = "other_action";
      }
    }

    return {
      ...schedule.toJSON(),
      shift_status,
      onduty,
      checkout,
      summary,
      work_type,
      latest_log: latest_log ? {
        log_type_id: latest_log.log_type_id,
        log_type_name: latest_log.log_type?.name,
        log_timestamp: latest_log.log_timestamp,
      } : null,
    };
  });

  const processedSchedules = schedulesWithStatus.map((schedule: any) => {
    if (schedule.employee) {
      schedule.employee = decryptAndCleanUserData(schedule.employee);
    }
    return schedule;
  });

  return processedSchedules;
};

export const getSchedulesByUserIdOnDepartment = async (userId: number) => {
  // Get user's department
  // const userWithDepartment = await UserModel.findOne({
  //   where: { id: userId },
  //   include: [
  //     {
  //       model: UserEmploymentModel,
  //       as: "user_employment",
  //       where: { is_active: true },
  //       required: true,
  //       attributes: ["department_id", "facility_id"],
  //     },
  //   ],
  // });

  const userWithDepartment = await UserModel.findOne({
    where: { id: userId },
    include: [
      {
        model: UserEmploymentModel,
        as: "user_employment",
        where: { 
          is_active: true,
          [Op.or]: [
            { is_part_time: false },
            { is_part_time: null },
            { is_job_applicant: false },
            { is_job_applicant: null }
          ]
        },
        required: true,
        attributes: ["department_id", "facility_id", "is_part_time", "is_job_applicant"],
      },
    ],
  });

  const user_employment = userWithDepartment?.user_employment as
    | UserEmploymentModel[]
    | undefined;

  if (!user_employment || user_employment.length === 0) {
    throw new Error("User employment data not found");
  }

  const userEmployment = user_employment[0];

  const departmentId = userEmployment.department_id;
  const facilityId = userEmployment.facility_id;

  if (!departmentId) {
    throw new Error("Department ID not found for the user");
  }

  // Get all users in the same department
  const usersInDepartment = await UserEmploymentModel.findAll({
    where: { 
      department_id: departmentId,
      facility_id: facilityId,
      is_active: true 
    },
    attributes: ["user_id", "is_part_time", "department_id", "facility_id"],
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: getBasicUserAttributes(),
        include: [
          {
            model: UserRoleModel,
            as: "user_role",
            attributes: ["id", "assigned_at"],
            required: false,
            include: [
              {
                model: RoleModel,
                as: "role",
                attributes: ["id", "name"],
                required: false,
              },
            ],
          },
        ],
      },
      {
        model: DepartmentModel,
        as: "department",
        attributes: ["id", "name"],
        required: false,
      },
      {
        model: FacilityModel,
        as: "facility",
        attributes: ["id", "name"],
        required: false,
      },
    ],
  });

  if (!usersInDepartment || usersInDepartment.length === 0) {
    throw new Error("No users found in the department");
  }

  // Create map for user part-time status and employment info
  const userPartTimeMap = new Map<number, boolean>();
  const userEmploymentInfoMap = new Map<number, { is_part_time: boolean; department: any; facility: any }>();
  const fullTimeUserIds: number[] = [];
  const partTimeUserIds: number[] = [];

  usersInDepartment.forEach((emp: any) => {
    const isPartTime = emp.is_part_time === true;
    userPartTimeMap.set(emp.user_id, isPartTime);
    
    // Store employment info (for part-time users, only if is_part_time is not true in this employment)
    userEmploymentInfoMap.set(emp.user_id, {
      is_part_time: isPartTime,
      department: emp.department || null,
      facility: emp.facility || null,
    });
    
    if (isPartTime) {
      partTimeUserIds.push(emp.user_id);
    } else {
      fullTimeUserIds.push(emp.user_id);
    }
  });

  // Get schedules for full-time employees (all schedules)
  const fullTimeSchedules = fullTimeUserIds.length > 0 
    ? await ScheduleShiftModel.findAll({
        where: { 
          employee_id: { [Op.in]: fullTimeUserIds }
        },
        include: [
          {
            model: UserModel,
            as: "employee",
            attributes: getBasicUserAttributes(),
            include: [
              {
                model: UserRoleModel,
                as: "user_role",
                attributes: ["id", "assigned_at"],
                required: false,
                include: [
                  {
                    model: RoleModel,
                    as: "role",
                    attributes: ["id", "name"],
                    required: false,
                  },
                ],
              },
            ],
          },
          {
            model: ShiftTypeModel,
            as: "shift_type",
            attributes: ["id", "name", "start_time", "end_time", "color_code", "short_name"],
          },
          {
            model: FacilityModel,
            as: "facility",
            attributes: ["id", "name", "latitude", "longitude", "address", "abbreviation", "is_active"],
          },
          {
            model: DepartmentModel,
            as: "department",
            attributes: ["id", "name"],
          },
        ],
        attributes: [
          "id",
          "schedule_master_id",
          "employee_id",
          "shift_date",
          "status_id",
          "init_employee_id",
          "remarks",
          "is_job_broadcast",
          "is_active",
          "created_at",
          "updated_at",
        ],
        order: [['shift_date', 'ASC'], ['employee_id', 'ASC']],
      })
    : [];

  // Get schedules for part-time employees (only job_broadcast with same department)
  const partTimeSchedules = partTimeUserIds.length > 0
    ? await ScheduleShiftModel.findAll({
        where: { 
          employee_id: { [Op.in]: partTimeUserIds },
          is_job_broadcast: true,
          department_id: departmentId
        },
        include: [
          {
            model: UserModel,
            as: "employee",
            attributes: getBasicUserAttributes(),
            include: [
              {
                model: UserRoleModel,
                as: "user_role",
                attributes: ["id", "assigned_at"],
                required: false,
                include: [
                  {
                    model: RoleModel,
                    as: "role",
                    attributes: ["id", "name"],
                    required: false,
                  },
                ],
              },
            ],
          },
          {
            model: ShiftTypeModel,
            as: "shift_type",
            attributes: ["id", "name", "start_time", "end_time", "color_code", "short_name"],
          },
          {
            model: FacilityModel,
            as: "facility",
            attributes: ["id", "name", "latitude", "longitude", "address", "abbreviation", "is_active"],
          },
          {
            model: DepartmentModel,
            as: "department",
            attributes: ["id", "name"],
          },
        ],
        attributes: [
          "id",
          "schedule_master_id",
          "employee_id",
          "shift_date",
          "status_id",
          "init_employee_id",
          "remarks",
          "is_job_broadcast",
          "is_active",
          "created_at",
          "updated_at",
        ],
        order: [['shift_date', 'ASC'], ['employee_id', 'ASC']],
      })
    : [];

  // Combine schedules
  const schedules = [...fullTimeSchedules, ...partTimeSchedules];

  // Get all user IDs for logs
  const allUserIds = [...fullTimeUserIds, ...partTimeUserIds];

  // Get all logs for these users
  const logs = await ScheduleShiftLogsModel.findAll({
    where: { user_id: { [Op.in]: allUserIds } },
    include: [
      {
        model: ScheduleShiftLogTypesModel,
        as: "log_type",
        attributes: ["id", "name"],
      },
      {
        model: WorkTypeModel,
        as: "work_type",
        attributes: ["id", "name"],
      },
    ],
    attributes: ["schedule_shift_id", "log_type_id", "work_type_id", "log_timestamp", "user_id"],
  });

  // Map logs by schedule_shift_id
  const logsMap = new Map<number, any[]>();
  logs.forEach((log) => {
    const shiftId = log.schedule_shift_id;
    if (!logsMap.has(shiftId)) {
      logsMap.set(shiftId, []);
    }
    logsMap.get(shiftId)!.push(log);
  });

  // Process schedules with status
  const schedulesWithStatus = schedules.map((schedule) => {
    const shiftLogs = logsMap.get(schedule.id) || [];
    
    let shift_status = "no_action";
    let latest_log = null;
    let onduty = null;
    let checkout = null;
    let summary: { time: string | null } = { time: null };
    let work_type: Array<{ id: number; name: string }> = [];

    if (shiftLogs.length > 0) {
      // Sort logs by time (latest first)
      const sortedLogs = shiftLogs.sort((a, b) => 
        new Date(b.log_timestamp).getTime() - new Date(a.log_timestamp).getTime()
      );
      
      latest_log = sortedLogs[0];
      
      // Find onduty & checkout logs
      const ondutylLog = shiftLogs.find(log => log.log_type_id === 1);
      const checkoutLog = shiftLogs.find(log => log.log_type_id === 2);

      // Build work_type list
      const wtMap = new Map<number, { id: number; name: string }>();
      shiftLogs.forEach((l) => {
        const wt = (l as any).work_type;
        if (wt && wt.id && !wtMap.has(wt.id)) {
          wtMap.set(wt.id, { id: wt.id, name: wt.name });
        }
      });
      work_type = Array.from(wtMap.values());
      
      // Process onduty
      if (ondutylLog) {
        onduty = {
          date: new Date(ondutylLog.log_timestamp).toISOString().split('T')[0],
          time: new Date(ondutylLog.log_timestamp).toTimeString().split(' ')[0]
        };
      }
      
      // Process checkout
      if (checkoutLog) {
        checkout = {
          date: new Date(checkoutLog.log_timestamp).toISOString().split('T')[0],
          time: new Date(checkoutLog.log_timestamp).toTimeString().split(' ')[0]
        };
      }
      
      // Calculate summary time
      if (ondutylLog && checkoutLog) {
        const ondutylTime = new Date(ondutylLog.log_timestamp);
        const checkoutTime = new Date(checkoutLog.log_timestamp);
        const diffMs = checkoutTime.getTime() - ondutylTime.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        summary.time = `${diffHours}:${diffMinutes.toString().padStart(2, '0')}`;
      }
      
      // Determine shift status
      switch (latest_log.log_type_id) {
        case 1:
          shift_status = "on_duty";
          break;
        case 2:
          shift_status = "checked_out";
          break;
        default:
          shift_status = "other_action";
      }
    }

    return {
      ...schedule.toJSON(),
      shift_status,
      onduty,
      checkout,
      summary,
      work_type,
      latest_log: latest_log ? {
        log_type_id: latest_log.log_type_id,
        log_type_name: latest_log.log_type?.name,
        log_timestamp: latest_log.log_timestamp,
      } : null,
    };
  });

  // Process PIPEDA decryption for schedules
  const processedSchedules = schedulesWithStatus.map((schedule: any) => {
    // Decrypt employee data
    if (schedule.employee) {
      schedule.employee = decryptAndCleanUserData(schedule.employee);
    }

    return schedule;
  });

  // Group schedules by employee
  const schedulesByEmployee = processedSchedules.reduce((acc: any, schedule: any) => {
    const employeeId = schedule.employee_id;
    
    if (!acc[employeeId]) {
      const employmentInfo = userEmploymentInfoMap.get(employeeId);
      
      acc[employeeId] = {
        employee: schedule.employee,
        is_part_time: userPartTimeMap.get(employeeId) || false,
        employment_info: employmentInfo ? {
          department: employmentInfo.department,
          facility: employmentInfo.facility,
        } : null,
        schedules: []
      };
    }
    
    acc[employeeId].schedules.push(schedule);
    
    return acc;
  }, {});

  // For part-time users, we need to fetch their full-time employment info
  const partTimeUserIdsSet = new Set(partTimeUserIds);
  const partTimeUsersFullTimeEmployments = partTimeUserIds.length > 0
    ? await UserEmploymentModel.findAll({
        where: { 
          user_id: { [Op.in]: partTimeUserIds },
          is_part_time: { [Op.or]: [false, null] },
          is_active: true
        },
        attributes: ["user_id", "department_id", "facility_id"],
        include: [
          {
            model: DepartmentModel,
            as: "department",
            attributes: ["id", "name"],
            required: false,
          },
          {
            model: FacilityModel,
            as: "facility",
            attributes: ["id", "name"],
            required: false,
          },
        ],
      })
    : [];

  // Map part-time users to their full-time employment
  const partTimeUserFullTimeEmploymentMap = new Map<number, { department: any; facility: any }>();
  partTimeUsersFullTimeEmployments.forEach((emp: any) => {
    if (!partTimeUserFullTimeEmploymentMap.has(emp.user_id)) {
      partTimeUserFullTimeEmploymentMap.set(emp.user_id, {
        department: emp.department || null,
        facility: emp.facility || null,
      });
    }
  });

  // Convert to array format
  const result = Object.keys(schedulesByEmployee).map(employeeId => {
    const empData = schedulesByEmployee[employeeId];
    const empId = parseInt(employeeId);
    
    // Determine department and facility based on employment type
    let department = null;
    let facility = null;
    
    if (empData.is_part_time) {
      // For part-time users, get their full-time employment info
      const fullTimeEmp = partTimeUserFullTimeEmploymentMap.get(empId);
      department = fullTimeEmp?.department || null;
      facility = fullTimeEmp?.facility || null;
    } else {
      // For full-time users, use the current employment info
      department = empData.employment_info?.department || null;
      facility = empData.employment_info?.facility || null;
    }

    // Return in the correct order: employee_id, employee, is_part_time, department, facility, schedules
    return {
      employee_id: empId,
      employee: empData.employee,
      is_part_time: empData.is_part_time,
      department: department,
      facility: facility,
      schedules: empData.schedules
    };
  });

  return {
    department_id: departmentId,
    facility_id: facilityId,
    total_employees: result.length,
    employees_schedules: result
  };
};

export const getSchedulesByUserIdPerWeek = async (userId: number) => {
  const currentDate = new Date();
  const weekFromNow = new Date();
  weekFromNow.setDate(currentDate.getDate() + 6);
  
  const startDate = currentDate.toISOString().split('T')[0];
  const endDate = weekFromNow.toISOString().split('T')[0];

  const schedules = await ScheduleShiftModel.findAll({
    where: { 
      employee_id: userId,
      shift_date: {
        [Op.between]: [startDate, endDate]
      }
    },
    include: [
      {
        model: UserModel,
        as: "employee",
        attributes: getBasicUserAttributes(),
      },
      {
        model: ShiftTypeModel,
        as: "shift_type",
        attributes: ["id", "name", "start_time", "end_time", "short_name", "color_code"],
        where: {
          short_name: {
            [Op.notIn]: ["X", "V"] // รอใส่ TRN
          }
        },
        required: true,
      },
      {
        model: FacilityModel,
        as: "facility",
        attributes: ["id", "name", "latitude", "longitude", "address", "abbreviation", "is_active"],
      },
      {
        model: DepartmentModel,
        as: "department",
        attributes: ["id", "name"],
      },
    ],
    attributes: [
      "id",
      "schedule_master_id",
      "shift_date",
      "status_id",
      "init_employee_id",
      "remarks",
      "is_active",
      "is_job_broadcast",
      "created_at",
      "updated_at",
    ],
    order: [
      ['shift_date', 'ASC'],
      [{ model: ShiftTypeModel, as: 'shift_type' }, 'start_time', 'ASC']
    ],
  });

  const logs = await ScheduleShiftLogsModel.findAll({
    where: { user_id: userId },
    include: [
      {
        model: ScheduleShiftLogTypesModel,
        as: "log_type",
        attributes: ["id", "name"],
      },
      {
        model: WorkTypeModel,
        as: "work_type",
        attributes: ["id", "name"],
      },
    ],
    attributes: ["schedule_shift_id", "log_type_id", "work_type_id", "log_timestamp"],
  });

  // map lookup logs by schedule_shift_id
  const logsMap = new Map<number, any[]>();
  logs.forEach((log) => {
    const shiftId = log.schedule_shift_id;
    if (!logsMap.has(shiftId)) {
      logsMap.set(shiftId, []);
    }
    logsMap.get(shiftId)!.push(log);
  });

  const schedulesWithStatus = schedules.map((schedule) => {
    const shiftLogs = logsMap.get(schedule.id) || [];
    
  let shift_status = "no_action";
  let latest_log = null;
  let onduty = null;
  let checkout = null;
  let summary: { time: string | null } = { time: null };
  let work_type: Array<{ id: number; name: string }> = [];

    if (shiftLogs.length > 0) {
      // sort logs by time (ล่าสุดก่อน)
      const sortedLogs = shiftLogs.sort((a, b) => 
        new Date(b.log_timestamp).getTime() - new Date(a.log_timestamp).getTime()
      );
      
      latest_log = sortedLogs[0];
      
      // onduty & checkout logs
      const ondutylLog = shiftLogs.find(log => log.log_type_id === 1);
      const checkoutLog = shiftLogs.find(log => log.log_type_id === 2);

      // work_type list 
      const wtMap = new Map<number, { id: number; name: string }>();
      shiftLogs.forEach((l) => {
        const wt = (l as any).work_type;
        if (wt && wt.id && !wtMap.has(wt.id)) {
          wtMap.set(wt.id, { id: wt.id, name: wt.name });
        }
      });
      work_type = Array.from(wtMap.values());
      
      // onduty
      if (ondutylLog) {
        onduty = {
          date: new Date(ondutylLog.log_timestamp).toISOString().split('T')[0],
          time: new Date(ondutylLog.log_timestamp).toTimeString().split(' ')[0]
        };
      }
      
      // checkout
      if (checkoutLog) {
        checkout = {
          date: new Date(checkoutLog.log_timestamp).toISOString().split('T')[0],
          time: new Date(checkoutLog.log_timestamp).toTimeString().split(' ')[0]
        };
      }
      
      // summary time
      if (ondutylLog && checkoutLog) {
        const ondutylTime = new Date(ondutylLog.log_timestamp);
        const checkoutTime = new Date(checkoutLog.log_timestamp);
        const diffMs = checkoutTime.getTime() - ondutylTime.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        summary.time = `${diffHours}:${diffMinutes.toString().padStart(2, '0')}`;
      }
      
      
      switch (latest_log.log_type_id) {
        case 1:
          shift_status = "on_duty";
          break;
        case 2:
          shift_status = "checked_out";
          break;
        default:
          shift_status = "other_action";
      }
    }

    return {
      ...schedule.toJSON(),
      shift_status,
      onduty,
      checkout,
      summary,
  work_type,
      latest_log: latest_log ? {
        log_type_id: latest_log.log_type_id,
        log_type_name: latest_log.log_type?.name,
        log_timestamp: latest_log.log_timestamp,
      } : null,
      // total_logs: shiftLogs.length,
    };
  });

  // Process PIPEDA decryption for schedules
  const processedSchedules = schedulesWithStatus.map((schedule: any) => {
    // Decrypt employee data
    if (schedule.employee) {
      schedule.employee = decryptAndCleanUserData(schedule.employee);
    }

    return schedule;
  });

  // console.log(`[getSchedulesByUserIdPerWeek] Found ${processedSchedules.length} schedules for user ${userId} from ${startDate} to ${endDate}`);

  return processedSchedules;
};



export const getAllJobsSchedules = async () => {
  const schedules = await ScheduleShiftModel.findAll({
    include: [
      {
        model: UserModel,
        as: "employee",
        attributes: getBasicUserAttributes(),
      },
      {
        model: ShiftTypeModel,
        as: "shift_type",
        attributes: ["id", "name", "start_time", "end_time", "color_code", "short_name"],
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
    attributes: [
      "id",
      "shift_date",
      "status_id",
      "init_employee_id",
      "remarks",
      "is_active",
      "created_at",
      "updated_at",
    ],
  });

  // Process PIPEDA decryption for schedules
  const processedSchedules = schedules.map((schedule: any) => {
    const scheduleData = schedule.get({ plain: true });

    // Decrypt employee data
    if (scheduleData.employee) {
      scheduleData.employee = decryptAndCleanUserData(scheduleData.employee);
    }

    return scheduleData;
  });

  return processedSchedules;
};

interface RawGroupedShift {
  shift_date: Date
  schedule_shift_ids: string
}

export const getGroupedScheduleShiftsByFacilitySQL = async (userId: number) => {
  const userWithFacility = await UserModel.findOne({
    where: { id: userId },
    include: [
      {
        model: UserEmploymentModel,
        as: "user_employment",
        where: { is_active: true },
        required: true,
      },
    ],
  });

  const userEmploymentData = userWithFacility!.user_employment;

  const userEmployments = Array.isArray(userEmploymentData)
    ? userEmploymentData
    : [userEmploymentData];

  if (userEmployments.length === 0) {
    throw new Error("User employment data not found or empty");
  }

  const facilityId = userEmployments[0].facility_id;
  if (!facilityId) {
    throw new Error("Facility ID not found for the user");
  }

  const allShifts = await ScheduleShiftModel.findAll({
    where: {
      facility_id: facilityId,
    },
    include: [
      {
        model: ShiftTypeModel,
        as: 'shift_type',
        required: true,
        attributes: [
          'id',
          'name',
          'start_time',
          'end_time',
          'roles_allowed',
          'department_id',
          'facility_id',
          'short_name',
          'color_code',
        ],
      },
    ],
    order: [["shift_date", "ASC"]],
  });

  if (!allShifts || allShifts.length === 0) {
    return {};
  }

  const groupedShifts = allShifts.reduce((acc, shift) => {
    const dateKey = new Date(shift.shift_date).toISOString().split("T")[0];

    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }

    acc[dateKey].push(shift.toJSON());

    return acc;
  }, {} as Record<string, ScheduleShiftModel[]>);

  return groupedShifts;
};