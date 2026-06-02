import GiveShiftRequestModel from "../models/GiveShiftRequestModel";
import ScheduleShiftModel from "../models/ScheduleShiftsModel";
import ShiftTypeModel from "../models/ShiftTypesModel";
import UserModel from "../models/UserModel";
import UserEmploymentModel from "../models/UserEmploymentsModel";
import DepartmentSupervisorModel from "../models/DepartmentSupervisorModel";
import * as NotificationsService from "../services/notificationsService";
import { Op } from "sequelize";
import {
  getUserAttributes,
  getBasicUserAttributes,
  getUserWithUsernameAttributes,
  decryptAndCleanUserData,
} from "../utils/encryptedFieldMapping";

// --- Helper: Format Date to Thai ---
const formatDateToThai = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
// --- Helper: Find Day Off Shift Type ---
const findDayOffShiftType = async (
  facilityId: number,
  departmentId: number
) => {
  const dayOff = await ShiftTypeModel.findOne({
    where: {
      facility_id: facilityId,
      department_id: departmentId,
      [Op.or]: [
        { name: { [Op.like]: "%Day Off%" } },
        { name: { [Op.like]: "%DayOff%" } },
        { short_name: "X" },
        { short_name: "DO" },
      ],
      is_active: true,
    },
  });

  if (!dayOff) {
    throw new Error(
      `Configuration Error: 'Day Off' shift type not found for Facility ID: ${facilityId}, Department ID: ${departmentId}.`
    );
  }
  return dayOff;
};

// --- Helper: Get Target User Shift ---
const getTargetUserShiftOnDate = async (
  targetUserId: number,
  date: string | Date
) => {
  return await ScheduleShiftModel.findOne({
    where: {
      employee_id: targetUserId,
      shift_date: date,
      is_active: true,
    },
    include: [
      {
        model: ShiftTypeModel,
        as: "shift_type",
      },
    ],
  });
};

// --- Helper: Notify Supervisors ---
const notifySupervisors = async (
  userId: number,
  title: string,
  message: string,
  data: any
) => {
  try {
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

// Create Request (User A)
export const createGiveShiftRequest = async (data: any) => {
  // ตรวจสอบเวรผู้ให้ (A)
  const shift = await ScheduleShiftModel.findByPk(data.shift_id, {
    include: [{ model: ShiftTypeModel, as: "shift_type" }],
  });
  if (!shift) throw new Error("Shift not found");

  if (shift.employee_id !== data.user_id) {
    throw new Error("You can only give away your own shift.");
  }

  // ตรวจสอบวันที่
  const shiftDate = new Date(shift.shift_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (shiftDate < today) throw new Error("Cannot give away a past shift.");

  // ตรวจสอบ Target User (B)
  const targetUser = await UserModel.findByPk(data.target_user_id);
  if (!targetUser) throw new Error("Target user not found.");

  // ตรวจสอบตารางเวรของผู้รับ (B)
  const targetShift = await getTargetUserShiftOnDate(
    data.target_user_id,
    shift.shift_date
  );

  if (targetShift) {
    const targetShiftType = (targetShift as any).shift_type;

    // ห้ามมีเวรซ้ำ
    if (targetShift.shift_type_id === shift.shift_type_id) {
      throw new Error("Target user already has the same shift on this date.");
    }

    // ห้ามเป็นวันลา หรือ อบรม
    if (targetShiftType) {
      // const isVacation =
      //   targetShiftType.name.includes("Vacation") ||
      //   targetShiftType.short_name === "V";
      const isTraining =
        targetShiftType.name.includes("อบรม") ||
        targetShiftType.short_name === "TRN";

      // if (isVacation || isTraining) {
      //   throw new Error(
      //     "Cannot give shift to target user because they are on Vacation or Training."
      //   );
      if (isTraining) {
        throw new Error(
          "Cannot give shift to target user because they are on Vacation."
        );
      }
    }
  }

  // สร้าง Request (บันทึก Snapshot)
  const shiftType = (shift as any).shift_type; // ดึง object shift_type ออกมา
  // สร้าง Request
  const request = await GiveShiftRequestModel.create({
    ...data,
    remark: data.remark,
    status: "PENDING",
    target_approve_status: "PENDING",
    shift_date: shift.shift_date,
    schedule_master_id: shift.schedule_master_id,
    month: data.month || new Date(shift.shift_date).getMonth() + 1,
    year: data.year || new Date(shift.shift_date).getFullYear(),

    // บันทึกข้อมูลเวรเดิมไว้
    original_shift_type_id: shift.shift_type_id,
    original_shift_type_name: shiftType ? shiftType.name : "Unknown",
  });

  // Notification: ถึงผู้รับ (B)
  try {
    const requester = await UserModel.findByPk(data.user_id, {
      attributes: getUserAttributes(),
    });
    const decryptedRequester = requester
      ? decryptAndCleanUserData(requester)
      : { first_name: "User" };
    const requesterName = `${decryptedRequester.first_name} ${
      decryptedRequester.last_name || ""
    }`.trim();

    const thaiDate = formatDateToThai(shift.shift_date);

    await NotificationsService.sendNotification({
      title: "มีคำขอยกเวรให้คุณ",
      message: `คุณ ${requesterName} ต้องการยกเวรวันที่ ${thaiDate} ให้คุณ`,
      notification_type_id: 1,
      target_channel: "user",
      target_value: data.target_user_id.toString(),
      data: {
        topic: "give_shift_request",
        action: "open_transfer_shift_request_detail_friend", 
        description: "WAITING FOR TARGET USER APPROVAL",
        giveShiftRequestId: request.id,
        shiftId: shift.id,
        type: "GIVE_SHIFT",
      },
      created_by: data.user_id,
    });
  } catch (err) {
    console.error("Failed to send create notification:", err);
  }

  return request;
};

export const updateGiveShiftRequest = async (
  id: number,
  updates: Partial<GiveShiftRequestModel>
) => {
  const request = await GiveShiftRequestModel.findByPk(id);
  if (!request) throw new Error("Request not found");

  // if (request.status !== "PENDING") {
  //   throw new Error(
  //     `Cannot update request with status: ${request.status}. Only PENDING requests can be updated.`
  //   );
  // }
  return await request.update(updates);
};

export const deleteGiveShiftRequest = async (id: number) => {
  const request = await GiveShiftRequestModel.findByPk(id);
  if (!request) throw new Error("Request not found");

  // if (request.status !== "PENDING") {
  //   throw new Error(
  //     `Cannot delete request with status: ${request.status}. Only PENDING requests can be deleted.`
  //   );
  // }

  return await request.destroy();
};

export const getGiveShiftRequestById = async (id: number) => {
  const request = await GiveShiftRequestModel.findByPk(id, {
    include: [
      {
        model: UserModel,
        as: "requester",
        attributes: getUserWithUsernameAttributes(),
      },
      {
        model: UserModel,
        as: "targetUser",
        attributes: getUserWithUsernameAttributes(),
      },
      {
        model: UserModel,
        as: "approve_user",
        attributes: getUserWithUsernameAttributes(),
        required: false,
      },
      {
        model: ScheduleShiftModel,
        as: "shift",
        include: [
          {
            model: ShiftTypeModel,
            as: "shift_type",
            attributes: ["name", "start_time", "end_time", "color_code"],
          },
        ],
      },
      {
        model: ShiftTypeModel,
        as: "originalShiftType",
        attributes: [
          "id",
          "name",
          "short_name",
          "start_time",
          "end_time",
          "color_code",
        ],
      },
    ],
  });

  if (!request) throw new Error("Request not found");

  const r = request.get({ plain: true });
  if (r.requester) r.requester = decryptAndCleanUserData(r.requester);
  if (r.targetUser) r.targetUser = decryptAndCleanUserData(r.targetUser);
  if (r.approve_user) {
    r.supervisor = decryptAndCleanUserData(r.approve_user);
    delete r.approve_user;
  } else {
    r.supervisor = {};
  }

  return r;
};

export const getAllGiveShiftRequests = async () => {
  const requests = await GiveShiftRequestModel.findAll({
    order: [["created_at", "DESC"]],
    include: [
      {
        model: UserModel,
        as: "requester",
        attributes: getUserWithUsernameAttributes(),
      },
      {
        model: UserModel,
        as: "targetUser",
        attributes: getUserWithUsernameAttributes(),
      },
      { model: ScheduleShiftModel, as: "shift" },
    ],
  });
  return requests.map((r) => {
    const d = r.get({ plain: true });
    if (d.requester) d.requester = decryptAndCleanUserData(d.requester);
    if (d.targetUser) d.targetUser = decryptAndCleanUserData(d.targetUser);
    return d;
  });
};

export const getGiveShiftRequestsByUserId = async (userId: number) => {
  const requests = await GiveShiftRequestModel.findAll({
    where: {
      [Op.or]: [{ user_id: userId }, { target_user_id: userId }],
    },
    include: [
      {
        model: UserModel,
        as: "requester",
        attributes: getUserWithUsernameAttributes(),
      },
      {
        model: UserModel,
        as: "targetUser",
        attributes: getUserWithUsernameAttributes(),
      },
      {
        model: UserModel,
        as: "approve_user",
        attributes: getUserWithUsernameAttributes(),
        required: false,
      },
      {
        model: ScheduleShiftModel,
        as: "shift",
        include: [
          {
            model: ShiftTypeModel,
            as: "shift_type",
            attributes: ["name", "start_time", "end_time", "color_code"],
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  return requests.map((r) => {
    const d = r.get({ plain: true });
    if (d.requester) d.requester = decryptAndCleanUserData(d.requester);
    if (d.targetUser) d.targetUser = decryptAndCleanUserData(d.targetUser);
    if (d.approve_user) {
      d.supervisor = decryptAndCleanUserData(d.approve_user);
      delete d.approve_user;
    } else {
      d.supervisor = {};
    }
    return d;
  });
};

export const getGiveShiftRequestsByUserIdMobile = async (userId: number) => {
  const requests = await GiveShiftRequestModel.findAll({
    where: {
      [Op.or]: [{ user_id: userId }],
    },
    include: [
      {
        model: UserModel,
        as: "requester",
        attributes: getUserWithUsernameAttributes(),
      },
      {
        model: UserModel,
        as: "targetUser",
        attributes: getUserWithUsernameAttributes(),
      },
      {
        model: UserModel,
        as: "approve_user",
        attributes: getUserWithUsernameAttributes(),
        required: false,
      },
      {
        model: ScheduleShiftModel,
        as: "shift",
        include: [
          {
            model: ShiftTypeModel,
            as: "shift_type",
            attributes: ["name", "start_time", "end_time", "color_code"],
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  return requests.map((r) => {
    const d = r.get({ plain: true });
    if (d.requester) d.requester = decryptAndCleanUserData(d.requester);
    if (d.targetUser) d.targetUser = decryptAndCleanUserData(d.targetUser);
    if (d.approve_user) {
      d.supervisor = decryptAndCleanUserData(d.approve_user);
      delete d.approve_user;
    } else {
      d.supervisor = {};
    }
    return d;
  });
};

export const getGiveShiftRequestsByUserIdTargeterMobile = async (userId: number) => {
  const requests = await GiveShiftRequestModel.findAll({
    where: {
      target_user_id: userId,
    },
    include: [
      {
        model: UserModel,
        as: "requester",
        attributes: getUserWithUsernameAttributes(),
      },
      {
        model: UserModel,
        as: "targetUser",
        attributes: getUserWithUsernameAttributes(),
      },
      {
        model: UserModel,
        as: "approve_user",
        attributes: getUserWithUsernameAttributes(),
        required: false,
      },
      {
        model: ScheduleShiftModel,
        as: "shift",
        include: [
          {
            model: ShiftTypeModel,
            as: "shift_type",
            attributes: ["name", "start_time", "end_time", "color_code"],
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  return requests.map((r) => {
    const d = r.get({ plain: true });
    if (d.requester) d.requester = decryptAndCleanUserData(d.requester);
    if (d.targetUser) d.targetUser = decryptAndCleanUserData(d.targetUser);
    if (d.approve_user) {
      d.supervisor = decryptAndCleanUserData(d.approve_user);
      delete d.approve_user;
    } else {
      d.supervisor = {};
    }
    return d;
  });
};

export const getGiveShiftRequestsByDepartmentMonthYear = async (
  departmentId: number,
  month: number,
  year: number
) => {
  const requests = await GiveShiftRequestModel.findAll({
    where: { month, year },
    include: [
      {
        model: ScheduleShiftModel,
        as: "shift",
        where: { department_id: departmentId },
        include: [{ model: ShiftTypeModel, as: "shift_type" }],
      },
      {
        model: UserModel,
        as: "requester",
        attributes: getUserWithUsernameAttributes(),
      },
      {
        model: UserModel,
        as: "targetUser",
        attributes: getUserWithUsernameAttributes(),
      },
      {
        model: ShiftTypeModel,
        as: "originalShiftType", // ต้องตรงกับที่ define ใน Model
        attributes: [
          "id",
          "name",
          "short_name",
          "color_code",
          "start_time",
          "end_time",
        ],
      },
    ],
  });
  return requests.map((r) => {
    const d = r.get({ plain: true });
    if (d.requester) d.requester = decryptAndCleanUserData(d.requester);
    if (d.targetUser) d.targetUser = decryptAndCleanUserData(d.targetUser);
    return d;
  });
};

export const getGiveShiftRequestsForSupervisor = async (userId: number) => {
  // Get user's supervised departments
  const supervisedDepartments = await DepartmentSupervisorModel.findAll({
    where: {
      user_id: userId,
      is_active: true,
    },
    attributes: ["department_id"],
  });

  if (!supervisedDepartments || supervisedDepartments.length === 0) {
    return [];
  }

  const departmentIds = supervisedDepartments.map((dept) => dept.department_id);

  // Get give shift requests where shift's department matches supervised departments
  const requests = await GiveShiftRequestModel.findAll({
    where: {
      target_approve_status: "APPROVED",
    },
    include: [
      {
        model: UserModel,
        as: "requester",
        attributes: getUserWithUsernameAttributes(),
        required: false,
      },
      {
        model: UserModel,
        as: "targetUser",
        attributes: getUserWithUsernameAttributes(),
        required: false,
      },
      {
        model: UserModel,
        as: "approve_user",
        attributes: getUserWithUsernameAttributes(),
        required: false,
      },
      {
        model: ScheduleShiftModel,
        as: "shift",
        required: true,
        where: {
          department_id: departmentIds,
        },
        include: [
          {
            model: ShiftTypeModel,
            as: "shift_type",
            attributes: ["name", "start_time", "end_time", "color_code"],
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  return requests.map((r) => {
    const d = r.get({ plain: true });
    if (d.requester) d.requester = decryptAndCleanUserData(d.requester);
    if (d.targetUser) d.targetUser = decryptAndCleanUserData(d.targetUser);
    if (d.approve_user) {
      d.supervisor = decryptAndCleanUserData(d.approve_user);
      delete d.approve_user;
    } else {
      d.supervisor = {};
    }
    return d;
  });
};

// Target User Actions (User B)
export const approveGiveShiftRequest = async (
  requestId: number,
  userId: number,
  comment?: string
) => {
  const request = await GiveShiftRequestModel.findByPk(requestId);
  if (!request) throw new Error("Request not found");

  if (request.target_approve_status !== "PENDING")
    throw new Error("Request is not pending approval from target");

  await request.update({
    target_approve_status: "APPROVED",
    target_remark: comment,
    target_approve_date: new Date(),
  });

  // --- Notification ---
  try {
    const targetUserObj = await UserModel.findByPk(request.target_user_id, {
      attributes: getUserAttributes(),
    });
    const decryptedTarget = targetUserObj
      ? decryptAndCleanUserData(targetUserObj)
      : { first_name: "User" };
    const targetName = `${decryptedTarget.first_name} ${
      decryptedTarget.last_name || ""
    }`.trim();

    const requesterUserObj = await UserModel.findByPk(request.user_id, {
      attributes: getUserAttributes(),
    });
    const decryptedRequester = requesterUserObj
      ? decryptAndCleanUserData(requesterUserObj)
      : { first_name: "User" };
    const requesterName = `${decryptedRequester.first_name} ${
      decryptedRequester.last_name || ""
    }`.trim();

    // ถึง A
    await NotificationsService.sendNotification({
      title: "คำขอยกเวรได้รับการตอบรับ",
      message: `${targetName} ตอบรับการยกเวรของคุณแล้ว รอการอนุมัติจากหัวหน้า`,
      notification_type_id: 1,
      target_channel: "user",
      target_value: request.user_id.toString(),
      data: { 
        topic: "give_shift_request",
        action: "open_transfer_shift_request_detail",
        giveShiftRequestId: request.id, status: "WAITING_SUPERVISOR" },
      created_by: userId,
    });

    // ถึง Supervisor
    await notifySupervisors(
      request.user_id,
      "แจ้งขออนุมัติยกเวร",
      `มีคำขอยกเวรจาก ${requesterName} ให้กับ ${targetName} รอการอนุมัติจากท่าน`,
      {
        topic: "give_shift_request",
        action: "open_transfer_shift_request_detail_supervisor",
        giveShiftRequestId: request.id,
        shiftId: request.shift_id,
        requesterUserId: request.user_id,
        targetUserId: request.target_user_id,
        status: "WAITING_SUPERVISOR_APPROVAL",
      }
    );
  } catch (err) {
    console.error("Failed to send approve notifications:", err);
  }

  return request;
};

export const rejectGiveShiftRequest = async (
  requestId: number,
  userId: number,
  comment?: string
) => {
  const request = await GiveShiftRequestModel.findByPk(requestId);
  if (!request) throw new Error("Request not found");

  await request.update({
    target_approve_status: "DECLINED",
    status: "DECLINED",
    target_remark: comment,
    target_approve_date: new Date(),
  });

  // --- Notification ---
  try {
    const targetUserObj = await UserModel.findByPk(request.target_user_id, {
      attributes: getUserAttributes(),
    });
    const decryptedTarget = targetUserObj
      ? decryptAndCleanUserData(targetUserObj)
      : { first_name: "User" };
    const targetName = `${decryptedTarget.first_name} ${
      decryptedTarget.last_name || ""
    }`.trim();

    await NotificationsService.sendNotification({
      title: "คำขอยกเวรถูกปฏิเสธ",
      message: `คุณ ${targetName} ปฏิเสธการรับเวรของคุณ`,
      notification_type_id: 1,
      target_channel: "user",
      target_value: request.user_id.toString(),
      data: { 
        topic: "give_shift_request",
        action: "open_transfer_shift_request_detail",
        giveShiftRequestId: request.id, status: "DECLINED" },
      created_by: userId,
    });
  } catch (err) {
    console.error("Failed to send reject notification:", err);
  }

  return request;
};

// Supervisor Actions

export const approveGiveShiftRequestSupervisor = async (
  requestId: number,
  comment: string,
  userId: number
) => {
  const request = await GiveShiftRequestModel.findByPk(requestId);
  if (!request) throw new Error("Request not found");

  if (request.target_approve_status !== "APPROVED") {
    throw new Error("Target user has not approved this request yet.");
  }

  const originalShift = await ScheduleShiftModel.findByPk(request.shift_id);
  if (!originalShift) throw new Error("Original shift not found");

  // หา Day Off Type
  const dayOffType = await findDayOffShiftType(
    originalShift.facility_id,
    originalShift.department_id
  );

  const originalShiftTypeId = originalShift.shift_type_id;

  // จัดการเวรของผู้รับ (B)
  const targetShift = await getTargetUserShiftOnDate(
    request.target_user_id,
    originalShift.shift_date
  );

  let newShiftForB;

  if (targetShift) {
    // ถ้า B มีเวร และเป็น Day Off -> อัปเดตทับเป็นเวรใหม่
    if (targetShift.shift_type_id === dayOffType.id) {
      await targetShift.update({
        shift_type_id: originalShiftTypeId,
        updated_by: userId,
        remarks: `Received from User ${request.user_id} (Approved by Supervisor) - Replaced DayOff`,
        start_time: originalShift.start_time,
        end_time: originalShift.end_time,
        total_hours: originalShift.total_hours,
        normal_hours: originalShift.normal_hours,
        ot_hours: originalShift.ot_hours,
      });
      newShiftForB = targetShift;
    } else {
      // ถ้า B มีเวรทำงานอื่น -> สร้างเวรใหม่ (Stacked)
      newShiftForB = await ScheduleShiftModel.create({
        schedule_master_id: originalShift.schedule_master_id,
        shift_type_id: originalShiftTypeId,
        employee_id: request.target_user_id,
        facility_id: originalShift.facility_id,
        department_id: originalShift.department_id,
        shift_date: originalShift.shift_date,
        status_id: originalShift.status_id,
        start_time: originalShift.start_time,
        end_time: originalShift.end_time,
        total_hours: originalShift.total_hours,
        normal_hours: originalShift.normal_hours,
        ot_hours: originalShift.ot_hours,
        init_employee_id: request.target_user_id,
        is_active: true,
        remarks: `Received from User ${request.user_id} (Approved by Supervisor) - Stacked Shift`,
        created_by: userId,
        updated_by: userId,
      });
    }
  } else {
    // ถ้า B ไม่มีเวรเลย -> สร้างใหม่
    newShiftForB = await ScheduleShiftModel.create({
      schedule_master_id: originalShift.schedule_master_id,
      shift_type_id: originalShiftTypeId,
      employee_id: request.target_user_id,
      facility_id: originalShift.facility_id,
      department_id: originalShift.department_id,
      shift_date: originalShift.shift_date,
      status_id: originalShift.status_id,
      start_time: originalShift.start_time,
      end_time: originalShift.end_time,
      total_hours: originalShift.total_hours,
      normal_hours: originalShift.normal_hours,
      ot_hours: originalShift.ot_hours,
      init_employee_id: request.target_user_id,
      is_active: true,
      remarks: `Received from User ${request.user_id} (Approved by Supervisor)`,
      created_by: userId,
      updated_by: userId,
    });
  }

  // อัปเดตเวรเดิมของ A เป็น Day Off (08:00-17:00)
  await originalShift.update({
    shift_type_id: dayOffType.id,
    updated_by: userId,
    remarks: `Given to User ${request.target_user_id} (Approved by Supervisor)`,
    start_time: "08:00:00",
    end_time: "17:00:00",
    total_hours: 0,
    normal_hours: 0,
    ot_hours: 0,
  });

  // Cleanup: ถ้า A มีเวรทำงานอื่นในวันนั้น ให้ลบ Day Off ทิ้ง
  const allShiftsOfA = await ScheduleShiftModel.findAll({
    where: {
      employee_id: request.user_id,
      shift_date: originalShift.shift_date,
      is_active: true,
    },
  });

  const workingShiftsA = allShiftsOfA.filter(
    (s) => s.shift_type_id !== dayOffType.id
  );

  if (workingShiftsA.length > 0) {
    // ย้าย shift_id ใน Request ไปชี้ที่เวรใหม่ของ B ก่อนลบเวรเก่าของ A
    await request.update({
      shift_id: newShiftForB.id,
      status: "APPROVED",
      approve_user_id: userId,
      approve_date: new Date(),
      approve_remark: comment,
    });

    await originalShift.destroy();
  } else {
    // ถ้าไม่ต้องลบ ก็แค่อัปเดต Status Request
    await request.update({
      status: "APPROVED",
      approve_user_id: userId,
      approve_date: new Date(),
      approve_remark: comment,
    });
  }

  // --- Notification ---
  try {
    const requesterUser = await UserModel.findByPk(request.user_id, {
      attributes: getUserAttributes(),
    });
    const targetUser = await UserModel.findByPk(request.target_user_id, {
      attributes: getUserAttributes(),
    });

    const decryptedRequester = requesterUser
      ? decryptAndCleanUserData(requesterUser)
      : { first_name: "User" };
    const decryptedTarget = targetUser
      ? decryptAndCleanUserData(targetUser)
      : { first_name: "User" };

    const requesterName = `${decryptedRequester.first_name} ${
      decryptedRequester.last_name || ""
    }`.trim();
    const targetName = `${decryptedTarget.first_name} ${
      decryptedTarget.last_name || ""
    }`.trim();

    // ถึง A
    await NotificationsService.sendNotification({
      title: "อนุมัติการยกเวร",
      message: `การยกเวรของคุณให้ ${targetName} ได้รับอนุมัติจากหัวหน้าแล้ว`,
      notification_type_id: 1,
      target_channel: "user",
      target_value: request.user_id.toString(),
      data: { 
        topic: "give_shift_request",
        action: "open_transfer_shift_request_detail",
        giveShiftRequestId: request.id, status: "APPROVED" },
      created_by: userId,
    });

    // ถึง B
    await NotificationsService.sendNotification({
      title: "อนุมัติการยกเวร",
      message: `การรับเวรจาก ${requesterName} ได้รับอนุมัติจากหัวหน้าแล้ว`,
      notification_type_id: 1,
      target_channel: "user",
      target_value: request.target_user_id.toString(),
      data: {
        topic: "give_shift_request",
        action: "open_transfer_shift_request_detail_friend",
        giveShiftRequestId: request.id,
        status: "APPROVED",
        newShiftId: newShiftForB.id,
      },
      created_by: userId,
    });
  } catch (err) {
    console.error("Failed to send supervisor approve notifications:", err);
  }

  return { request, newShiftForB };
};

export const rejectGiveShiftRequestSupervisor = async (
  requestId: number,
  comment: string,
  userId: number
) => {
  const request = await GiveShiftRequestModel.findByPk(requestId);
  if (!request) throw new Error("Request not found");

  await request.update({
    status: "DECLINED",
    approve_user_id: userId,
    approve_date: new Date(),
    approve_remark: comment,
  });

  // --- Notification ---
  try {
    const requesterUser = await UserModel.findByPk(request.user_id, {
      attributes: getUserAttributes(),
    });
    const targetUser = await UserModel.findByPk(request.target_user_id, {
      attributes: getUserAttributes(),
    });

    const decryptedRequester = requesterUser
      ? decryptAndCleanUserData(requesterUser)
      : { first_name: "User" };
    const decryptedTarget = targetUser
      ? decryptAndCleanUserData(targetUser)
      : { first_name: "User" };

    const requesterName = `${decryptedRequester.first_name} ${
      decryptedRequester.last_name || ""
    }`.trim();
    const targetName = `${decryptedTarget.first_name} ${
      decryptedTarget.last_name || ""
    }`.trim();

    // ถึง A
    await NotificationsService.sendNotification({
      title: "ปฏิเสธการยกเวร",
      message: `คำขอยกเวรให้ ${targetName} ถูกปฏิเสธโดยหัวหน้า`,
      notification_type_id: 1,
      target_channel: "user",
      target_value: request.user_id.toString(),
      data: {
        topic: "give_shift_request",
        action: "open_transfer_shift_request_detail", 
        giveShiftRequestId: request.id, status: "DECLINED" },
      created_by: userId,
    });

    // ถึง B
    await NotificationsService.sendNotification({
      title: "ปฏิเสธการยกเวร",
      message: `คำขอรับเวรจาก ${requesterName} ถูกปฏิเสธโดยหัวหน้า`,
      notification_type_id: 1,
      target_channel: "user",
      target_value: request.target_user_id.toString(),
      data: {
        topic: "give_shift_request",
        action: "open_transfer_shift_request_detail_friend", 
        giveShiftRequestId: request.id, status: "DECLINED" },
      created_by: userId,
    });
  } catch (err) {
    console.error("Failed to send supervisor reject notifications:", err);
  }

  return request;
};
