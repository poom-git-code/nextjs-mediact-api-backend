import ScheduleShiftLogsModel from "../models/ScheduleShiftLogsModel";
import { getUserAttributes, getBasicUserAttributes, getUserWithUsernameAttributes, decryptAndCleanUserData } from "../utils/encryptedFieldMapping";
import ScheduleShiftLogTypesModel from "../models/ScheduleShiftLogTypesModel";
import ScheduleShiftModel from "../models/ScheduleShiftsModel";
import ShiftTypeModel from "../models/ShiftTypesModel";
import UserModel from "../models/UserModel";
import { Op } from "sequelize";

// Create a new schedule shift log
export const createScheduleShiftLog = async (data: any) => {

  try {
    if (!data.work_type_id && data.user_id && data.schedule_shift_id) {
      const prev = await ScheduleShiftLogsModel.findOne({
        where: {
          user_id: data.user_id,
          schedule_shift_id: data.schedule_shift_id,
          work_type_id: { [Op.ne]: null },
        },
        order: [["log_timestamp", "DESC"]],
      });
      if (prev && (prev as any).work_type_id) {
        data.work_type_id = (prev as any).work_type_id;
      }
    }
  } catch (err) {
    // fallback: 
    console.warn("Failed to infer work_type_id for schedule shift log:", err);
  }

  // Ensure log_timestamp is set and normalized to Date object
  data.log_timestamp = data.log_timestamp ? new Date(data.log_timestamp) : new Date();

  const newLog = await ScheduleShiftLogsModel.create(data);

  // Update schedule_shifts table ตาม log_type_id
  if (data.schedule_shift_id && data.log_timestamp) {
    try {
      const scheduleShift = await ScheduleShiftModel.findByPk(data.schedule_shift_id, {
        include: [
          {
            model: ShiftTypeModel,
            as: "shift_type",
            attributes: ["id", "start_time", "end_time"],
          },
        ],
      });
      
      if (scheduleShift) {
        const shiftData = scheduleShift.get({ plain: true }) as any;
        const logTimestamp = new Date(data.log_timestamp);
        
        if (data.log_type_id === 1) {
          const updateData: any = {
            actual_check_in: data.log_timestamp
          };

          if (shiftData.shift_type && shiftData.shift_type.start_time && shiftData.shift_date) {
            const shiftDate = new Date(shiftData.shift_date);
            const [startHours, startMinutes, startSeconds] = shiftData.shift_type.start_time.split(':');

            const scheduledStartTime = new Date(shiftDate);
            scheduledStartTime.setHours(parseInt(startHours), parseInt(startMinutes), parseInt(startSeconds || '0'), 0);

            const diffMs = logTimestamp.getTime() - scheduledStartTime.getTime();

            if (diffMs > 0) {
              const lateMinutes = Math.floor(diffMs / (1000 * 60));
              updateData.late_minutes = lateMinutes;
            } else {
              // ถ้ามาก่อนเวลาหรือตรงเวลา ให้เป็น 0
              updateData.late_minutes = 0;
            }
          }

          await scheduleShift.update(updateData);
        }

        else if (data.log_type_id === 2) {
          const updateData: any = {
            actual_check_out: data.log_timestamp
          };

          // if normal_hours 
          if (data.normal_hours !== undefined) {
            updateData.normal_hours = parseFloat(Number(data.normal_hours).toFixed(2));
          }

          // if ot_hours 
          if (data.ot_hours !== undefined) {
            updateData.ot_hours = parseFloat(Number(data.ot_hours).toFixed(2));
          }

          // if total_hours 
          if (data.total_hours !== undefined) {
            updateData.total_hours = parseFloat(Number(data.total_hours).toFixed(2));
          }

          if (shiftData.shift_type && shiftData.shift_type.end_time && shiftData.shift_date) {
            const shiftDate = new Date(shiftData.shift_date);
            const [endHours, endMinutes, endSeconds] = shiftData.shift_type.end_time.split(':');

            const scheduledEndTime = new Date(shiftDate);
            scheduledEndTime.setHours(parseInt(endHours), parseInt(endMinutes), parseInt(endSeconds || '0'), 0);

            if (shiftData.shift_type.start_time) {
              const [startHours] = shiftData.shift_type.start_time.split(':');
              if (parseInt(endHours) < parseInt(startHours)) {
                scheduledEndTime.setDate(scheduledEndTime.getDate() + 1);
              }
            }

            const diffMs = logTimestamp.getTime() - scheduledEndTime.getTime();

            if (diffMs > 0) {
              const earlyLeaveMinutes = Math.floor(diffMs / (1000 * 60));
              updateData.early_leave_minutes = earlyLeaveMinutes;
            } else {
              // ถ้าออกก่อนเวลาหรือตรงเวลา ให้เป็น 0
              updateData.early_leave_minutes = 0;
            }
          }

          await scheduleShift.update(updateData);
        }
      }
    } catch (err) {
      console.warn("Failed to update schedule shift actual times:", err);
    }
  }

  return newLog;
};

// not test yet
// Update a schedule shift log
export const updateScheduleShiftLog = async (id: number, updates: Partial<ScheduleShiftLogsModel>) => {
  const log = await ScheduleShiftLogsModel.findByPk(id);
  if (!log) {
    throw new Error("Schedule shift log not found");
  }
  return await log.update(updates);
};

// not test yet
// Delete a schedule shift log
export const deleteScheduleShiftLog = async (id: number) => {
  const log = await ScheduleShiftLogsModel.findByPk(id);
  if (!log) {
    throw new Error("Schedule shift log not found");
  }

  // ลบข้อมูลที่เกี่ยวข้องใน schedule_shifts ก่อนลบ log
  if (log.schedule_shift_id && log.log_type_id) {
    try {
      const scheduleShift = await ScheduleShiftModel.findByPk(log.schedule_shift_id);
      
      if (scheduleShift) {
        const updateData: any = {};
        
        if (log.log_type_id === 1) {
          updateData.actual_check_in = null;
          updateData.late_minutes = 0;
        }
        
        else if (log.log_type_id === 2) {
          updateData.actual_check_out = null;
          updateData.early_leave_minutes = 0;
        }
        
        await scheduleShift.update(updateData);
      }
    } catch (err) {
      console.warn("Failed to update schedule shift when deleting log:", err);
    }
  }

  return await log.destroy();
};

// not test yet
// Get schedule shift log by ID
export const getScheduleShiftLogById = async (id: number) => {
  const log = await ScheduleShiftLogsModel.findByPk(id, {
    include: [
      {
        model: ScheduleShiftModel,
        as: "schedule_shift",
        attributes: ["id", "shift_date", "start_time", "end_time"],
      },
      {
        model: UserModel,
        as: "user",
        attributes: getBasicUserAttributes(),
      },
      {
        model: UserModel,
        as: "updater",
        attributes: getBasicUserAttributes(),
      },
      {
        model: ScheduleShiftLogTypesModel,
        as: "log_type",
        attributes: ["id", "name", "description"],
      },
    ],
  });
  
  if (!log) {
    throw new Error("Schedule shift log not found");
  }

  // Process PIPEDA decryption for log
  const logData = log.get({ plain: true });

  // Decrypt user data
  if (logData.user) {
    logData.user = decryptAndCleanUserData(logData.user);
  }

  // Decrypt updater data
  if (logData.updater) {
    logData.updater = decryptAndCleanUserData(logData.updater);
  }
  
  return logData;
};

// not test yet
// Get all schedule shift logs with pagination and filters
export const getAllScheduleShiftLogs = async (options: {
//   page?: number;
//   limit?: number;
  schedule_shift_id?: number;
  user_id?: number;
  log_type_id?: number;
  start_date?: string;
  end_date?: string;
}) => {
//   const { page = 1, limit = 10, schedule_shift_id, user_id, log_type_id, start_date, end_date } = options;
  
  const where: any = {};
  
//   if (schedule_shift_id) {
//     where.schedule_shift_id = schedule_shift_id;
//   }
  
//   if (user_id) {
//     where.user_id = user_id;
//   }
  
//   if (log_type_id) {
//     where.log_type_id = log_type_id;
//   }
  
//   if (start_date && end_date) {
//     where.log_timestamp = {
//       [Op.between]: [new Date(start_date), new Date(end_date)],
//     };
//   } else if (start_date) {
//     where.log_timestamp = {
//       [Op.gte]: new Date(start_date),
//     };
//   } else if (end_date) {
//     where.log_timestamp = {
//       [Op.lte]: new Date(end_date),
//     };
//   }
  
//   const offset = (page - 1) * limit;
  
  const { count, rows } = await ScheduleShiftLogsModel.findAndCountAll({
    where,
    include: [
      {
        model: ScheduleShiftModel,
        as: "schedule_shift",
        attributes: ["id", "shift_date", "start_time", "end_time"],
      },
      {
        model: UserModel,
        as: "user",
        attributes: getBasicUserAttributes(),
      },
      {
        model: UserModel,
        as: "updater",
        attributes: getBasicUserAttributes(),
      },
      {
        model: ScheduleShiftLogTypesModel,
        as: "log_type",
        attributes: ["id", "name", "description"],
      },
    ],
    order: [["log_timestamp", "DESC"]],
    // limit,
    // offset,
  });

  // Process PIPEDA decryption for logs
  const processedLogs = rows.map((log: any) => {
    const logData = log.get({ plain: true });

    // Decrypt user data
    if (logData.user) {
      logData.user = decryptAndCleanUserData(logData.user);
    }

    // Decrypt updater data
    if (logData.updater) {
      logData.updater = decryptAndCleanUserData(logData.updater);
    }

    return logData;
  });
  
  return {
    logs: processedLogs,
    // pagination: {
    //   total: count,
    //   page,
    //   limit,
    //   totalPages: Math.ceil(count / limit),
    // },
  };
};

// not test yet
// Get logs by schedule shift ID
export const getLogsByScheduleShiftId = async (schedule_shift_id: number) => {
  const logs = await ScheduleShiftLogsModel.findAll({
    where: { schedule_shift_id },
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: getBasicUserAttributes(),
      },
      {
        model: UserModel,
        as: "updater",
        attributes: getBasicUserAttributes(),
      },
      {
        model: ScheduleShiftLogTypesModel,
        as: "log_type",
        attributes: ["id", "name", "description"],
      },
    ],
    order: [["log_timestamp", "ASC"]],
  });

  // Process PIPEDA decryption for logs
  const processedLogs = logs.map((log: any) => {
    const logData = log.get({ plain: true });

    // Decrypt user data
    if (logData.user) {
      logData.user = decryptAndCleanUserData(logData.user);
    }

    // Decrypt updater data
    if (logData.updater) {
      logData.updater = decryptAndCleanUserData(logData.updater);
    }

    return logData;
  });

  return processedLogs;
};

// not test yet
// Get logs by user ID
export const getLogsByUserId = async (user_id: number, options: {
  start_date?: string;
  end_date?: string;
  log_type_id?: number;
}) => {
  const { start_date, end_date, log_type_id } = options;
  
  const where: any = { user_id };
  
  if (log_type_id) {
    where.log_type_id = log_type_id;
  }
  
  if (start_date && end_date) {
    where.log_timestamp = {
      [Op.between]: [new Date(start_date), new Date(end_date)],
    };
  } else if (start_date) {
    where.log_timestamp = {
      [Op.gte]: new Date(start_date),
    };
  } else if (end_date) {
    where.log_timestamp = {
      [Op.lte]: new Date(end_date),
    };
  }
  
  return await ScheduleShiftLogsModel.findAll({
    where,
    include: [
      {
        model: ScheduleShiftModel,
        as: "schedule_shift",
        attributes: ["id", "shift_date", "start_time", "end_time"],
      },
      {
        model: UserModel,
        as: "updater",
        attributes: getBasicUserAttributes(),
      },
      {
        model: ScheduleShiftLogTypesModel,
        as: "log_type",
        attributes: ["id", "name", "description"],
      },
    ],
    order: [["log_timestamp", "DESC"]],
  }).then((logs: any[]) => {
    // Process PIPEDA decryption for logs
    return logs.map((log: any) => {
      const logData = log.get({ plain: true });

      // Decrypt updater data
      if (logData.updater) {
        logData.updater = decryptAndCleanUserData(logData.updater);
      }

      return logData;
    });
  });
};

// not test yet
// Get latest log for a schedule shift
export const getLatestLogByScheduleShiftId = async (schedule_shift_id: number, log_type_id?: number) => {
  const where: any = { schedule_shift_id };
  
  if (log_type_id) {
    where.log_type_id = log_type_id;
  }
  
  const log = await ScheduleShiftLogsModel.findOne({
    where,
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: getBasicUserAttributes(),
      },
      {
        model: ScheduleShiftLogTypesModel,
        as: "log_type",
        attributes: ["id", "name", "description"],
      },
    ],
    order: [["log_timestamp", "DESC"]],
  });

  if (!log) {
    return null;
  }

  // Process PIPEDA decryption for log
  const logData = log.get({ plain: true });

  // Decrypt user data
  if (logData.user) {
    logData.user = decryptAndCleanUserData(logData.user);
  }

  return logData;
};

// not test yet
// Bulk create logs
export const bulkCreateScheduleShiftLogs = async (logsData: any[]) => {
  return await ScheduleShiftLogsModel.bulkCreate(logsData);
};
