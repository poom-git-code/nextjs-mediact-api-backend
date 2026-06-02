import { Op } from "sequelize";
import RequestShiftModel from "../models/RequestShiftModel";
import UserModel from "../models/UserModel";
import ShiftTypeModel from "../models/ShiftTypesModel";
import UserEmploymentModel from "../models/UserEmploymentsModel";
import FacilityModel from "../models/FacilitiesModel";
import {
  decryptAndCleanUserData,
  getBasicUserAttributes,
} from "../utils/encryptedFieldMapping";
import * as NotificationsService from "../services/notificationsService";
import DepartmentSupervisorModel from "../models/DepartmentSupervisorModel";
import { sequelize } from "../config/database";
import ScheduleMasterModel from "../models/ScheduleMasterModel";
import ScheduleShiftModel from "../models/ScheduleShiftsModel";
import FacilityHolidayModel from "../models/FacilityHolidayModel";
import DepartmentOperatingHoursModel from "../models/DepartmentOperatingHoursModel";
import ShiftTypeRoleModel from "../models/ShiftTypeRoleModel";
import DepartmentModel from "../models/DepartmentModel";

const formatDateToThai = (dateString: string): string => {
  const date = new Date(dateString);
  const thaiMonths = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${
    date.getFullYear() + 543
  }`;
};

// --- Helper Functions ---
const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

const isHoliday = (date: Date, holidays: any[]): boolean => {
  if (!holidays || holidays.length === 0) return false;
  // Compare dates only (ignoring time)
  const checkTime = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();
  return holidays.some((h: any) => {
    const hDateVal = h.holiday_date || h.date;
    if (!hDateVal) return false;
    const hDate = new Date(hDateVal);
    const hTime = new Date(
      hDate.getFullYear(),
      hDate.getMonth(),
      hDate.getDate()
    ).getTime();
    return hTime === checkTime;
  });
};

const calculateScheduleStats = async (
  facilityId: number,
  departmentId: number,
  year: number,
  month: number,
  transaction: any
) => {
  const totalDays = getDaysInMonth(year, month);

  // 1. Fetch Data
  const operatingHours = await DepartmentOperatingHoursModel.findAll({
    where: { department_id: departmentId, is_active: true },
    transaction,
  });

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  // Fix timezone issue by setting time to 12:00 for date range query
  startDate.setHours(12, 0, 0, 0);
  endDate.setHours(12, 0, 0, 0);

  const holidays = await FacilityHolidayModel.findAll({
    where: {
      facility_id: facilityId,
      holiday_date: { [Op.between]: [startDate, endDate] },
    },
    transaction,
  });

  const totalMembers = await UserEmploymentModel.count({
    where: {
      department_id: departmentId,
      facility_id: facilityId,
      is_active: true,
    },
    transaction,
  });

  // Filter shift types: exclude X, V, TRN and is_default=1
  const shiftTypes = await ShiftTypeModel.findAll({
    where: {
      department_id: departmentId,
      is_active: true,
      is_default: { [Op.ne]: 1 },
      short_name: { [Op.notIn]: ["X", "V", "TRN"] },
    },
    include: [
      { model: ShiftTypeRoleModel, as: "shift_type_roles", required: false },
    ],
    transaction,
  });

  const department = await DepartmentModel.findByPk(departmentId, {
    transaction,
  });
  const includeWeekend = department?.include_weekend || false;
  const includeHoliday = department?.include_holiday || false;

  // --- Variables for Calculation ---
  let workingDays = 0; // Total days considered as "working" for the department based on config
  let weekendsCount = 0;
  let holidayDaysCount = 0;
  let weekdayCount = 0; // Regular weekdays (Mon-Fri, non-holiday)

  let totalShiftsNeeded = 0;
  let totalWorkingHoursRequired = 0; // Demand
  let operatingDaysCount = 0;

  const operatingDaysMap = new Set(
    operatingHours.map((h: any) => h.weekday.toLowerCase())
  );
  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const shortDayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  // --- Loop every day in month ---
  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month - 1, day);
    const _isWeekend = isWeekend(date);
    const _isHoliday = isHoliday(date, holidays);

    const dayOfWeek = date.getDay();
    const dayName = dayNames[dayOfWeek];
    const shortDayName = shortDayMap[dayOfWeek];

    // Check if Department Operates this day (based on operating_hours)
    const isOperatingDayConfig =
      operatingDaysMap.has(dayName) || operatingDaysMap.has(shortDayName);

    // --- Calculate Schedule Header Logic: getWorkingDays() ---
    let isWorkingDayForStats = false;

    if (_isHoliday) {
      holidayDaysCount++;
      if (isOperatingDayConfig && includeHoliday) {
        workingDays++;
        isWorkingDayForStats = true;
      }
    } else if (_isWeekend) {
      weekendsCount++;
      if (isOperatingDayConfig && includeWeekend) {
        workingDays++;
        isWorkingDayForStats = true;
      }
    } else {
      // Weekday
      if (isOperatingDayConfig) {
        weekdayCount++;
        workingDays++;
        isWorkingDayForStats = true;
      }
    }

    if (isWorkingDayForStats) {
      operatingDaysCount++;
    }

    // --- Calculate Demand (Total Shifts & Hours Needed) ---
    const isOperatingDayForDemand =
      (!_isWeekend && !_isHoliday) || // Regular working day
      (_isWeekend && includeWeekend) || // Weekend & Dept operates
      (_isHoliday && includeHoliday); // Holiday & Dept operates

    if (isOperatingDayForDemand) {
      // Calculate Shifts & Hours Needed for this day
      shiftTypes.forEach((st: any) => {
        let requiredStaff = 0;

        if (st.shift_type_roles && st.shift_type_roles.length > 0) {
          st.shift_type_roles.forEach((role: any) => {
            if (_isHoliday) {
              requiredStaff += role.min_count_weekend || role.min_count || 0; // Often holiday uses weekend rule
            } else if (_isWeekend) {
              requiredStaff += role.min_count_weekend || role.min_count || 0;
            } else {
              requiredStaff += role.min_count_weekday || role.min_count || 0;
            }
          });
        } else {
          // Fallback
          if (_isHoliday)
            requiredStaff = st.min_staff_holiday || st.min_staff_weekend || 1;
          else if (_isWeekend) requiredStaff = st.min_staff_weekend || 1;
          else requiredStaff = st.min_staff_weekday || 1;
        }

        totalShiftsNeeded += requiredStaff;
        totalWorkingHoursRequired +=
          requiredStaff * (Number(st.total_hours) || 8);
      });
    }
  }

  // --- Final Statistics Calculation (Matching ScheduleHeader) ---

  const standardWorkingDays = weekdayCount;
  const workingHoursPerPerson = standardWorkingDays * 8;

  // 2. Total Regular Hours Available (Supply)
  const totalRegularHoursAvailable = totalMembers * workingHoursPerPerson;

  // 3. OT Hours Required (Gap)
  const totalOtHoursRequired = Math.max(
    0,
    totalWorkingHoursRequired - totalRegularHoursAvailable
  );

  // 4. FTE Calculation
  // FTE = Demand / Standard Individual Supply
  const totalFte =
    workingHoursPerPerson > 0
      ? totalWorkingHoursRequired / workingHoursPerPerson
      : 0;

  // 5. Additional Members Needed
  const additionalMembersRequired =
    totalOtHoursRequired > 0
      ? Math.ceil(totalOtHoursRequired / workingHoursPerPerson)
      : 0;

  const totalDayoffs = totalDays - workingDays;

  return {
    total_working_days: standardWorkingDays, // Mon-Fri operating days
    working_hours_per_person: workingHoursPerPerson,
    total_dayoffs: totalDayoffs,
    total_holidays: holidayDaysCount,
    total_fte: parseFloat(totalFte.toFixed(2)),
    total_shifts_needed: totalShiftsNeeded,
    total_working_hours_required: parseFloat(
      totalWorkingHoursRequired.toFixed(2)
    ),
    total_members: totalMembers,
    total_regular_hours_available: parseFloat(
      totalRegularHoursAvailable.toFixed(2)
    ),
    total_ot_hours_required: parseFloat(totalOtHoursRequired.toFixed(2)),
    additional_members_required: additionalMembersRequired,
    total_operating_days: operatingDaysCount, // Total active days
  };
};

// --- Helper: Notify Supervisors ---
const notifySupervisors = async (
  userId: number,
  title: string,
  message: string,
  data: any
) => {
  try {
    // หา Department ของ User คนที่ขอ
    const userWithEmployment = await UserModel.findOne({
      where: { id: userId },
      include: [
        {
          model: UserEmploymentModel,
          as: "user_employment",
          where: { is_active: true },
          required: false,
        },
      ],
    });

    const user_employment = userWithEmployment?.user_employment as
      | UserEmploymentModel[]
      | undefined;

    if (!user_employment || user_employment.length === 0) return;

    const departmentId = user_employment[0].department_id;
    if (!departmentId) return;

    // หา Supervisor ของ Department นั้น
    const supervisors = await DepartmentSupervisorModel.findAll({
      where: { department_id: departmentId },
      include: [
        {
          model: UserModel,
          as: "user",
          attributes: getBasicUserAttributes(),
          required: true,
        },
      ],
    });

    // ส่ง Notification หา Supervisor ทุกคน
    for (const supervisor of supervisors) {
      await NotificationsService.sendNotification({
        title,
        message,
        notification_type_id: 1,
        target_channel: "user",
        target_value: supervisor.user_id.toString(),
        data,
        created_by: userId,
      });
    }
  } catch (error) {
    console.error("Error sending notification to supervisors:", error);
  }
};

export const createRequestShift = async (data: any) => {
  const { request_user_id, month, year, items, reason, created_by } = data;

  const recordsToCreate: any[] = [];
  const transaction = await sequelize.transaction();

  try {
    for (const item of items) {
      const { request_date, shift_type_ids, reason: dailyReason } = item;

      // 1. Check Past Date
      const checkDate = new Date(request_date);
      const today = new Date();
      checkDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (checkDate.getTime() < today.getTime()) {
        throw new Error(
          `ไม่สามารถขอเวรย้อนหลังได้ (วันที่ ${formatDateToThai(
            request_date.toString()
          )})`
        );
      }

      for (const shiftTypeId of shift_type_ids) {
        // 2. Check Duplicate
        const existingRequest = await RequestShiftModel.findOne({
          where: {
            request_user_id: request_user_id,
            request_date: request_date,
            shift_type_id: shiftTypeId,
            status: "Pending",
          },
          transaction,
        });

        if (existingRequest) {
          const shiftInfo = await ShiftTypeModel.findByPk(shiftTypeId);
          const shiftName = shiftInfo ? shiftInfo.name : shiftTypeId;
          throw new Error(
            `ซ้ำ! คุณมีคำขอวันที่ ${formatDateToThai(
              request_date
            )} กะ '${shiftName}' รออนุมัติอยู่แล้ว`
          );
        }

        recordsToCreate.push({
          request_user_id,
          request_date,
          month,
          year,
          shift_type_id: shiftTypeId,
          status: "Pending",
          reason: dailyReason || reason,
          created_by: created_by || request_user_id,
        });
      }
    }

    const createdRecords = await RequestShiftModel.bulkCreate(recordsToCreate, {
      transaction,
    });

    await transaction.commit();

    // try {
    //   await notifySupervisors(
    //     request_user_id,
    //     "มีคำขอขึ้นเวรใหม่",
    //     `มีคำขอขึ้นเวรใหม่จำนวน ${recordsToCreate.length} รายการ รอการตรวจสอบ`,
    //     {
    //       action: "view_request_list",
    //       count: recordsToCreate.length,
    //       type: "request_shift_create",
    //     }
    //   );
    // } catch (notifyErr) {
    //   console.error("Failed to notify supervisors logic:", notifyErr);
    //   // ไม่ throw error เพื่อให้การ create สำเร็จ
    // }

    return createdRecords;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const updateRequestShift = async (
  id: number,
  updates: Partial<RequestShiftModel>,
  updatedBy: number
) => {
  const requestShift = await RequestShiftModel.findByPk(id);
  if (!requestShift) throw new Error("Request shift not found");

  // if (requestShift.status !== "Pending") {
  //   throw new Error("สามารถแก้ไขได้เฉพาะรายการที่สถานะเป็น Pending เท่านั้น");
  // }

  // Check Past Date (If date changed)
  if (updates.request_date) {
    const checkDate = new Date(updates.request_date);
    const today = new Date();
    checkDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (checkDate.getTime() < today.getTime()) {
      throw new Error(
        `ไม่สามารถแก้ไขวันที่เป็นย้อนหลังได้ (วันที่ ${formatDateToThai(
          updates.request_date.toString()
        )})`
      );
    }
  }

  // Check Duplicate
  if (updates.request_date || updates.shift_type_id) {
    const targetDate = updates.request_date || requestShift.request_date;
    const targetShiftTypeId =
      updates.shift_type_id || requestShift.shift_type_id;

    const existingRequest = await RequestShiftModel.findOne({
      where: {
        request_user_id: requestShift.request_user_id,
        request_date: targetDate,
        shift_type_id: targetShiftTypeId,
        status: "Pending",
        id: { [Op.ne]: id },
      },
    });

    if (existingRequest) {
      const shiftInfo = await ShiftTypeModel.findByPk(targetShiftTypeId);
      const shiftName = shiftInfo ? shiftInfo.name : targetShiftTypeId;
      throw new Error(
        `ไม่สามารถแก้ไขข้อมูลได้ เนื่องจากมีคำขอขึ้นเวรวันที่ ${formatDateToThai(
          targetDate.toString()
        )} กะ '${shiftName}' ที่รออนุมัติอยู่แล้ว`
      );
    }
  }

  const updated = await requestShift.update({
    ...updates,
    updated_by: updatedBy,
    updated_at: new Date(),
  });

  return updated;
};

export const deleteRequestShift = async (id: number) => {
  const requestShift = await RequestShiftModel.findByPk(id);
  if (!requestShift) throw new Error("Request shift not found");

  // if (requestShift.status !== "Pending") {
  //   throw new Error("สามารถลบได้เฉพาะรายการที่สถานะเป็น Pending เท่านั้น");
  // }

  await requestShift.destroy();
  return requestShift;
};

export const getRequestShiftById = async (id: number) => {
  const requestShift = await RequestShiftModel.findByPk(id, {
    include: [
      { model: ShiftTypeModel, as: "shift_type" },
      {
        model: UserModel,
        as: "request_user",
        attributes: getBasicUserAttributes(),
      },
    ],
  });

  if (!requestShift) throw new Error("Request shift not found");

  const plainData = requestShift.get({ plain: true });
  if (plainData.request_user) {
    plainData.request_user = decryptAndCleanUserData(plainData.request_user);
  }
  return plainData;
};

export const getAllRequestShifts = async () => {
  return await RequestShiftModel.findAll({ order: [["created_at", "DESC"]] });
};

export const getRequestShiftsByUserId = async (userId: number) => {
  const requests = await RequestShiftModel.findAll({
    where: { request_user_id: userId },
    include: [
      { model: ShiftTypeModel, as: "shift_type" },
      {
        model: UserModel,
        as: "request_user",
        required: false,
        attributes: getBasicUserAttributes(),
      },
      {
        model: UserModel,
        as: "approve_user",
        required: false,
        attributes: getBasicUserAttributes(),
      },
    ],
    order: [["created_at", "DESC"]],
  });

  return requests.map((req: any) => {
    const data = req.get({ plain: true });
    if (data.request_user) {
      data.request_user = decryptAndCleanUserData(data.request_user);
    }
    if (data.approve_user) {
      data.approve_user = decryptAndCleanUserData(data.approve_user);
    }
    return data;
  });
};

export const getRequestShiftsByFacility = async (userId: number) => {
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

  if (
    !user_employment ||
    user_employment.length === 0 ||
    !user_employment[0].facility_id
  ) {
    throw new Error("Facility ID not found for the user");
  }

  const facilityId = user_employment[0].facility_id;

  const requests = await RequestShiftModel.findAll({
    include: [
      {
        model: UserModel,
        as: "request_user",
        required: true,
        include: [
          {
            model: UserEmploymentModel,
            as: "user_employment",
            where: { facility_id: facilityId, is_active: true },
            required: true,
          },
        ],
        attributes: getBasicUserAttributes(),
      },
      { model: ShiftTypeModel, as: "shift_type" },
      {
        model: UserModel,
        as: "approve_user",
        required: false,
        attributes: getBasicUserAttributes(),
      },
    ],
    order: [["created_at", "DESC"]],
  });

  return requests.map((req: any) => {
    const data = req.get({ plain: true });
    if (data.request_user)
      data.request_user = decryptAndCleanUserData(data.request_user);
    if (data.approve_user)
      data.approve_user = decryptAndCleanUserData(data.approve_user);
    return data;
  });
};

// --- Approve Request Shift ---
export const approveRequestShift = async (
  id: number,
  approveUserId: number,
  remark?: string
) => {
  const transaction = await sequelize.transaction();

  try {
    const request = await RequestShiftModel.findByPk(id, { transaction });
    if (!request) throw new Error("Request shift not found");

    if (request.status !== "Pending") {
      throw new Error("Only pending requests can be approved");
    }

    const userEmployment = await UserEmploymentModel.findOne({
      where: {
        user_id: request.request_user_id,
        is_active: true,
      },
      transaction,
    });

    if (!userEmployment) {
      throw new Error(
        "User employment info not found. Cannot create schedule."
      );
    }

    const { department_id, facility_id } = userEmployment;

    // Check/Create Schedule Master
    // let scheduleMaster = await ScheduleMasterModel.findOne({
    //   where: {
    //     facility_id,
    //     department_id,
    //     month: request.month,
    //     year: request.year,
    //   },
    //   transaction,
    // });

    // if (!scheduleMaster) {
    //   const department = await DepartmentModel.findByPk(department_id, {
    //     attributes: ["name"],
    //     transaction,
    //   });

    //   //  Calculate Statistics with new logic
    //   const stats = await calculateScheduleStats(
    //     facility_id,
    //     department_id,
    //     request.year,
    //     request.month,
    //     transaction
    //   );

    //   scheduleMaster = await ScheduleMasterModel.create(
    //     {
    //       department_id,
    //       facility_id,
    //       month: request.month,
    //       year: request.year,
    //       status_id: 1,
    //       date: new Date(request.year, request.month - 1, 1),
    //       is_active: true,
    //       created_by: approveUserId,
    //       updated_by: approveUserId,

    //       department_name: department?.name || null,

    //       total_working_days: 0,
    //       working_hours_per_person: 0,
    //       total_dayoffs: 0,
    //       total_holidays: 0,
    //       total_fte: 0,
    //       total_shifts_needed: 0,
    //       total_working_hours_required: 0,
    //       total_members: 0,
    //       total_regular_hours_available: 0,
    //       total_ot_hours_required: 0,
    //       additional_members_required: 0,
    //       // total_operating_days: stats.total_operating_days,
    //     },
    //     { transaction }
    //   );
    // }

    const shiftType = await ShiftTypeModel.findByPk(request.shift_type_id, {
      transaction,
    });
    if (!shiftType) throw new Error("Shift type details not found");

    // await ScheduleShiftModel.create(
    //   {
    //     schedule_master_id: scheduleMaster.id,
    //     shift_type_id: request.shift_type_id,
    //     employee_id: request.request_user_id,
    //     facility_id: facility_id,
    //     department_id: department_id,
    //     shift_date: request.request_date,
    //     status_id: 1,
    //     start_time: shiftType.start_time,
    //     end_time: shiftType.end_time,
    //     init_employee_id: request.request_user_id,
    //     remarks: request.reason || remark,
    //     is_active: true,
    //     created_by: approveUserId,
    //     updated_by: approveUserId,
    //     total_hours: shiftType.total_hours || 0,
    //     normal_hours: shiftType.normal_hours || 0,
    //     ot_hours: shiftType.ot_hours || 0,
    //     late_minutes: 0,
    //     early_leave_minutes: 0,
    //     is_overtime: false,
    //     is_replacement: false,
    //     is_job_broadcast: false,
    //   },
    //   { transaction }
    // );

    const updated = await request.update(
      {
        status: "Approved",
        approve_user_id: approveUserId,
        approve_date: new Date(),
        remark: remark || null,
        updated_by: approveUserId,
      },
      { transaction }
    );

    await transaction.commit();

    try {
      await NotificationsService.sendNotification({
        title: "Shift Request Approved",
        message: `Your shift request for ${formatDateToThai(
          request.request_date.toString()
        )} has been approved.`,
        notification_type_id: 1,
        target_channel: "user",
        target_value: request.request_user_id.toString(),
        created_by: approveUserId,
        data: {
          requestShiftId: request.id,
          is_approved: true,
          type: "request_shift_update",
        },
      });
    } catch (error) {
      console.error("Failed to send approval notification:", error);
    }

    return updated;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const rejectRequestShift = async (
  id: number,
  approveUserId: number,
  remark?: string
) => {
  const request = await RequestShiftModel.findByPk(id);
  if (!request) throw new Error("Request shift not found");

  if (request.status !== "Pending") {
    throw new Error("Only pending requests can be rejected");
  }

  const updated = await request.update({
    status: "Rejected",
    approve_user_id: approveUserId,
    approve_date: new Date(),
    remark: remark || null,
    updated_by: approveUserId,
  });

  try {
    await NotificationsService.sendNotification({
      title: "คำขอขึ้นเวรถูกปฏิเสธ",
      message: `คำขอขึ้นเวรของคุณในวันที่ ${formatDateToThai(
        request.request_date.toString()
      )} ถูกปฏิเสธ${remark ? `\nเหตุผล: ${remark}` : ""}`,
      notification_type_id: 1,
      target_channel: "user",
      target_value: request.request_user_id.toString(),
      created_by: approveUserId,
      data: {
        requestShiftId: request.id,
        is_approved: false,
        type: "request_shift_update",
      },
    });
  } catch (error) {
    console.error("Failed to send rejection notification:", error);
  }

  return updated;
};
