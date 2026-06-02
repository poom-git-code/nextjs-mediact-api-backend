import LeaveRequestModel from "../models/LeaveRequestModel";
import { getUserAttributes, getBasicUserAttributes, getUserWithUsernameAttributes, decryptAndCleanUserData } from "../utils/encryptedFieldMapping";
import UserModel from "../models/UserModel";
import LeaveTypeModel from "../models/LeaveTypeModel";
import UserEmploymentModel from "../models/UserEmploymentsModel";
import FacilityModel from "../models/FacilitiesModel";
import FacilityLeaveLimitsModel from "../models/LeaveLimitsModel";
import * as NotificationsService from "../services/notificationsService";
import { Op } from "sequelize";

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

  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543;

  return `${day} ${month} ${year}`;
};

export const createLeaveRequest = async (data: any) => {
  const userWithFacility = await UserModel.findOne({
    where: { id: data.user_id },
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
    throw new Error("ไม่พบข้อมูลการจ้างงานของผู้ใช้");
  }

  if (!user_employment[0].facility_id) {
    throw new Error("ไม่พบข้อมูล facility ของผู้ใช้");
  }

  const facilityId = user_employment[0].facility_id;

  const leaveLimit = await FacilityLeaveLimitsModel.findOne({
    where: {
      facility_id: facilityId,
      leave_type_id: data.leave_type_id,
    },
    include: [
      {
        model: LeaveTypeModel,
        as: "leave_type",
        attributes: ["id", "name", "description"],
      },
    ],
  });

  if (!leaveLimit) {
    throw new Error("ไม่พบขีดจำกัดการลาสำหรับประเภทการลานี้ในหน่วยงานของคุณ");
  }

  const usedDays = await LeaveRequestModel.count({
    where: {
      user_id: data.user_id,
      leave_type_id: data.leave_type_id,
      status: "approved",
    },
  });

  const pendingDays = await LeaveRequestModel.count({
    where: {
      user_id: data.user_id,
      leave_type_id: data.leave_type_id,
      status: "pending",
    },
  });

  const totalUsedAndPending = usedDays + pendingDays;
  const remainingDays = leaveLimit.max_days - totalUsedAndPending;

  if (remainingDays <= 0) {
    throw new Error(
      `ไม่สามารถสร้างคำขอลาได้ เนื่องจากใช้วันลาครบตามขีดจำกัดแล้ว (${totalUsedAndPending}/${
        leaveLimit.max_days
      } วัน) สำหรับประเภทการลา: ${
        (leaveLimit as any).leave_type?.name || "ไม่ระบุ"
      }`
    );
  }

  // ตรวจสอบว่ามี leave request ที่ pending ในวันเดียวกันหรือไม่
  const existingPendingRequest = await LeaveRequestModel.findOne({
    where: {
      user_id: data.user_id,
      leave_date: data.leave_date,
      status: "pending",
    },
  });

  if (existingPendingRequest) {
    throw new Error(
      "มีคำขอลาที่รออนุมัติในวันเดียวกันแล้ว กรุณาตรวจสอบคำขอลาเดิมหรือยกเลิกก่อนสร้างใหม่"
    );
  }

  // ตรวจสอบว่ามี leave request ที่ approved ในวันเดียวกันหรือไม่
  const existingApprovedRequest = await LeaveRequestModel.findOne({
    where: {
      user_id: data.user_id,
      leave_date: data.leave_date,
      status: "approved",
    },
  });

  if (existingApprovedRequest) {
    throw new Error(
      "มีคำขอลาที่อนุมัติแล้วในวันเดียวกัน ไม่สามารถสร้างคำขอลาใหม่ได้"
    );
  }

  // ตรวจสอบเวลาที่ซ้อนทับกันในวันเดียวกัน (สำหรับ status pending หรือ approved)
  const overlappingRequests = await LeaveRequestModel.findAll({
    where: {
      user_id: data.user_id,
      leave_date: data.leave_date,
      status: {
        [Op.in]: ["pending", "approved"],
      },
      [Op.or]: [
        // เวลาเริ่มต้นของ request ใหม่อยู่ระหว่างเวลาของ request เดิม
        {
          start_time: {
            [Op.lte]: data.start_time,
          },
          end_time: {
            [Op.gt]: data.start_time,
          },
        },
        // เวลาสิ้นสุดของ request ใหม่อยู่ระหว่างเวลาของ request เดิม
        {
          start_time: {
            [Op.lt]: data.end_time,
          },
          end_time: {
            [Op.gte]: data.end_time,
          },
        },
        // request ใหม่ครอบคลุม request เดิม
        {
          start_time: {
            [Op.gte]: data.start_time,
          },
          end_time: {
            [Op.lte]: data.end_time,
          },
        },
      ],
    },
  });

  if (overlappingRequests.length > 0) {
    const statusText =
      overlappingRequests[0].status === "pending" ? "รออนุมัติ" : "อนุมัติแล้ว";
    throw new Error(
      `มีคำขอลาที่${statusText}ในช่วงเวลาที่ซ้อนทับกันแล้ว (${overlappingRequests[0].start_time} - ${overlappingRequests[0].end_time})`
    );
  }

  const leave = await LeaveRequestModel.create(data);

  // await NotificationsService.sendNotification({
  //   title: "สร้างคำขอลาสำเร็จ",
  //   message: `มีคำขอลาใหม่จาก user ${leave.user_id}`,
  //   target_channel: "user",
  //   target_value: leave.user_id.toString(),
  //   data: { leaveRequestId: leave.id },
  // });

  return leave;
};

export const updateLeaveRequest = async (
  id: number,
  updates: Partial<LeaveRequestModel>
) => {
  const leave = await LeaveRequestModel.findByPk(id);
  if (!leave) throw new Error("Leave request not found");
  const updated = await leave.update(updates);

  // await NotificationsService.sendNotification({
  //   title: "อัปเดตคำขอลา",
  //   message: `คำขอลา ${updated.id} ถูกอัปเดต`,
  //   target_channel: "user",
  //   target_value: updated.user_id.toString(),
  //   data: { leaveRequestId: updated.id }
  // });

  return updated;
};

export const deleteLeaveRequest = async (id: number) => {
  const leave = await LeaveRequestModel.findByPk(id);
  if (!leave) throw new Error("Leave request not found");
  await leave.destroy();

  // await NotificationsService.sendNotification({
  //   title: "ลบคำขอลา",
  //   message: `คำขอลา ${leave.id} ถูกลบแล้ว`,
  //   target_channel: "user",
  //   target_value: leave.user_id.toString(),
  //   data: { leaveRequestId: leave.id }
  // });

  return leave;
};

export const getLeaveRequestById = async (id: number) => {
  const leaveRequest = await LeaveRequestModel.findByPk(id, {
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: getBasicUserAttributes(),
        required: false,
      },
      {
        model: LeaveTypeModel,
        as: "leave_type",
        attributes: ["id", "name", "description"],
        required: false,
      },
      {
        model: UserModel,
        as: "approve_user",
        attributes: getBasicUserAttributes(),
        required: false,
      },
    ],
  });
  if (!leaveRequest) throw new Error("Leave request not found");

  // Process PIPEDA decryption for leave request
  const leaveData = leaveRequest.get({ plain: true });

  // Decrypt user data
  if (leaveData.user) {
    leaveData.user = decryptAndCleanUserData(leaveData.user);
  }

  // Decrypt approve_user data
  if (leaveData.approve_user) {
    leaveData.approve_user = decryptAndCleanUserData(leaveData.approve_user);
  }

  return leaveData;
};

export const getAllLeaveRequests = async () => {
  const leaveRequests = await LeaveRequestModel.findAll({
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: getBasicUserAttributes(),
        required: false,
      },
      {
        model: LeaveTypeModel,
        as: "leave_type",
        attributes: ["id", "name", "description"],
        required: false,
      },
      {
        model: UserModel,
        as: "approve_user",
        attributes: getBasicUserAttributes(),
        required: false,
      },
    ],
    order: [["created_at", "DESC"]],
  });

  // Process PIPEDA decryption for leave requests
  const processedLeaveRequests = leaveRequests.map((leaveRequest: any) => {
    const leaveData = leaveRequest.get({ plain: true });

    // Decrypt user data
    if (leaveData.user) {
      leaveData.user = decryptAndCleanUserData(leaveData.user);
    }

    // Decrypt approve_user data
    if (leaveData.approve_user) {
      leaveData.approve_user = decryptAndCleanUserData(leaveData.approve_user);
    }

    return leaveData;
  });

  return processedLeaveRequests;
};

export const getLeaveRequestsByFacility = async (userId: number) => {
  console.log("Fetching leave requests for user ID:", userId);

  // ตรวจสอบว่า userId เป็นตัวเลขที่ถูกต้อง
  if (!userId || isNaN(userId) || userId <= 0) {
    throw new Error("Invalid user ID provided");
  }

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
  console.log("facilityId: ", facilityId);

  const leaveRequests = await LeaveRequestModel.findAll({
    include: [
      {
        model: UserModel,
        as: "user",
        required: true,
        include: [
          {
            model: UserEmploymentModel,
            as: "user_employment",
            where: {
              facility_id: facilityId,
              is_active: true,
            },
            required: true,
          },
        ],
        attributes: getBasicUserAttributes(),
      },
      {
        model: LeaveTypeModel,
        as: "leave_type",
        attributes: ["id", "name", "description"],
        required: false,
      },
      {
        model: UserModel,
        as: "approve_user",
        attributes: getBasicUserAttributes(),
        required: false,
      },
    ],
    order: [["created_at", "DESC"]],
  });

  // Process PIPEDA decryption for leave requests
  const processedLeaveRequests = leaveRequests.map((leaveRequest: any) => {
    const leaveData = leaveRequest.get({ plain: true });

    // Decrypt user data
    if (leaveData.user) {
      leaveData.user = decryptAndCleanUserData(leaveData.user);
    }

    // Decrypt approve_user data
    if (leaveData.approve_user) {
      leaveData.approve_user = decryptAndCleanUserData(leaveData.approve_user);
    }

    return leaveData;
  });

  return processedLeaveRequests;
};

export const getLeaveRequestsByUserId = async (userId: number) => {
  const leaveRequests = await LeaveRequestModel.findAll({
    where: { user_id: userId },
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: getBasicUserAttributes(),
        required: false,
      },
      {
        model: LeaveTypeModel,
        as: "leave_type",
        attributes: ["id", "name", "description"],
        required: false,
      },
      {
        model: UserModel,
        as: "approve_user",
        attributes: getBasicUserAttributes(),
        required: false,
      },
    ],
    order: [["created_at", "DESC"]],
  });

  // Process PIPEDA decryption for leave requests
  const processedLeaveRequests = leaveRequests.map((leaveRequest: any) => {
    const leaveData = leaveRequest.get({ plain: true });

    // Decrypt user data
    if (leaveData.user) {
      leaveData.user = decryptAndCleanUserData(leaveData.user);
    }

    // Decrypt approve_user data
    if (leaveData.approve_user) {
      leaveData.approve_user = decryptAndCleanUserData(leaveData.approve_user);
    }

    return leaveData;
  });

  return processedLeaveRequests;
};

export const getLeaveSummaryByUserId = async (userId: number) => {
  console.log("Fetching leave summary for user ID:", userId);

  if (!userId || isNaN(userId) || userId <= 0) {
    throw new Error("Invalid user ID provided");
  }

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

  if (!user_employment[0].facility_id) {
    throw new Error("Facility ID not found for the user");
  }

  const facilityId = user_employment[0].facility_id;
  console.log("facilityId: ", facilityId);

  const leaveLimits = await FacilityLeaveLimitsModel.findAll({
    where: { facility_id: facilityId },
    include: [
      {
        model: LeaveTypeModel,
        as: "leave_type",
        attributes: ["id", "name", "description"],
      },
    ],
    order: [["leave_type_id", "ASC"]],
  });

  const leaveSummary = await Promise.all(
    leaveLimits.map(async (limit) => {
      const usedDays = await LeaveRequestModel.count({
        where: {
          user_id: userId,
          leave_type_id: limit.leave_type_id,
          status: "approved",
        },
      });

      const pendingDays = await LeaveRequestModel.count({
        where: {
          user_id: userId,
          leave_type_id: limit.leave_type_id,
          status: "pending",
        },
      });

      return {
        leave_type: (limit as any).leave_type,
        max_days: limit.max_days,
        used_days: usedDays || 0,
        pending_days: pendingDays || 0,
        remaining_days: limit.max_days - (usedDays || 0) - (pendingDays || 0),
      };
    })
  );

  // คำนวณสรุปรวม
  const totalMaxDays = leaveSummary.reduce(
    (sum, item) => sum + item.max_days,
    0
  );
  const totalUsedDays = leaveSummary.reduce(
    (sum, item) => sum + item.used_days,
    0
  );
  const totalPendingDays = leaveSummary.reduce(
    (sum, item) => sum + item.pending_days,
    0
  );
  const totalRemainingDays = leaveSummary.reduce(
    (sum, item) => sum + item.remaining_days,
    0
  );

  return {
    user_id: userId,
    facility_id: facilityId,
    facility_name: (user_employment[0].facility as any)?.name || "Unknown",
    summary: {
      total_max_days: totalMaxDays,
      total_used_days: totalUsedDays,
      total_pending_days: totalPendingDays,
      total_remaining_days: totalRemainingDays,
    },
    leave_types: leaveSummary,
  };
};

export const approveLeaveRequest = async (
  id: number,
  approveUserId: number,
  remark?: string
) => {
  const leaveRequest = await LeaveRequestModel.findByPk(id);
  if (!leaveRequest) throw new Error("Leave request not found");

  if (leaveRequest.status !== "Pending") {
    throw new Error("Only pending leave requests can be approved");
  }

  // Update leave request status to approved
  const updatedLeaveRequest = await leaveRequest.update({
    status: "approved",
    approve_user_id: approveUserId,
    approve_date: new Date(),
    remark: remark || null,
    updated_by: approveUserId,
  });

  // Send notification to user
  await NotificationsService.sendNotification({
    title: "คำขอลาได้รับการอนุมัติ",
    message: `คำขอลาของคุณในวันที่ ${formatDateToThai(
      leaveRequest.leave_date.toString()
    )} \nได้รับการอนุมัติแล้ว`,
    notification_type_id: 1,
    target_channel: "user",
    target_value: leaveRequest.user_id?.toString(),
    data: { leaveRequestId: leaveRequest.id, is_approved: true },
  });

  return updatedLeaveRequest;
};

export const rejectLeaveRequest = async (
  id: number,
  approveUserId: number,
  remark?: string
) => {
  const leaveRequest = await LeaveRequestModel.findByPk(id);
  if (!leaveRequest) throw new Error("Leave request not found");

  // ตรวจสอบว่า status เป็น pending หรือไม่
  if (leaveRequest.status !== "Pending") {
    throw new Error("Only pending leave requests can be rejected");
  }

  // Update leave request status to rejected
  const updatedLeaveRequest = await leaveRequest.update({
    status: "rejected",
    approve_user_id: approveUserId,
    approve_date: new Date(),
    remark: remark || null,
    updated_by: approveUserId,
  });

  // Send notification to user
  await NotificationsService.sendNotification({
    title: "คำขอลาถูกปฏิเสธ",
    message: `คำขอลาของคุณในวันที่ ${formatDateToThai(
      leaveRequest.leave_date.toString()
    )} } \nถูกปฏิเสธ${remark ? `: ${remark}` : ""}`,
    notification_type_id: 1,
    target_channel: "user",
    target_value: leaveRequest.user_id?.toString(),
    data: { leaveRequestId: leaveRequest.id, is_approved: false },
  });

  return updatedLeaveRequest;
};
