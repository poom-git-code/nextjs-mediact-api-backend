import DayOffModel from "../models/DayOffModel";
import { getUserAttributes, getBasicUserAttributes, getUserWithUsernameAttributes, decryptAndCleanUserData } from "../utils/encryptedFieldMapping";
import UserModel from "../models/UserModel";
import UserEmploymentModel from "../models/UserEmploymentsModel";
import * as NotificationsService from "../services/notificationsService";
import FacilityModel from "../models/FacilitiesModel";
import { PipedaUserDataHandler } from '../middleware/pipedaUserDataHandler';

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

export const createDayOff = async (data: any) => {
  const dayOff = await DayOffModel.create(data);

  // Optional: Send notification with reason if provided
  // const notificationMessage = `มีคำขอวันหยุดใหม่จาก user ${dayOff.request_user_id}${
  //   dayOff.reason ? `\nเหตุผล: ${dayOff.reason}` : ""
  // }`;
  // await NotificationsService.sendNotification({
  //   title: "สร้างคำขอวันหยุด",
  //   message: notificationMessage,
  //   target_channel: "user",
  //   target_value: dayOff.request_user_id.toString(),
  //   data: { dayOffId: dayOff.id, reason: dayOff.reason }
  // });

  return dayOff;
};

export const updateDayOff = async (
  id: number,
  updates: Partial<DayOffModel>
) => {
  const dayOff = await DayOffModel.findByPk(id);
  if (!dayOff) throw new Error("Day off request not found");
  const updated = await dayOff.update(updates);

  // await NotificationsService.sendNotification({
  //   title: "อัปเดตคำขอวันหยุด",
  //   message: `คำขอวันหยุด ${updated.id} ถูกอัปเดต`,
  //   target_channel: "user",
  //   target_value: updated.request_user_id.toString(),
  //   data: { dayOffId: updated.id },
  // });

  return updated;
};

export const deleteDayOff = async (id: number) => {
  const dayOff = await DayOffModel.findByPk(id);
  if (!dayOff) throw new Error("Day off request not found");
  await dayOff.destroy();

  // await NotificationsService.sendNotification({
  //   title: "ลบคำขอวันหยุด",
  //   message: `คำขอวันหยุด ${dayOff.id} ถูกลบแล้ว`,
  //   target_channel: "user",
  //   target_value: dayOff.request_user_id.toString(),
  //   data: { dayOffId: dayOff.id },
  // });

  return dayOff;
};

export const getDayOffById = async (id: number) => {
  const dayOff = await DayOffModel.findByPk(id);
  if (!dayOff) throw new Error("Day off request not found");
  return dayOff;
};

export const getAllDayOffs = async () => {
  return await DayOffModel.findAll({ order: [["created_at", "DESC"]] });
};

export const getDayOffsByFacility = async (userId: number) => {
  console.log("Fetching day offs for user ID:", userId);
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

  const dayOffs = await DayOffModel.findAll({
    include: [
      {
        model: UserModel,
        as: "request_user",
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
        model: UserModel,
        as: "assign_user",
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

  // Process PIPEDA decryption for dayOffs
  const processedDayOffs = dayOffs.map((dayOff: any) => {
    const dayOffData = dayOff.get({ plain: true });

    // Decrypt request_user data
    if (dayOffData.request_user) {
      dayOffData.request_user = decryptAndCleanUserData(dayOffData.request_user);
    }

    // Decrypt assign_user data
    if (dayOffData.assign_user) {
      dayOffData.assign_user = decryptAndCleanUserData(dayOffData.assign_user);
    }

    // Decrypt approve_user data
    if (dayOffData.approve_user) {
      dayOffData.approve_user = decryptAndCleanUserData(dayOffData.approve_user);
    }

    return dayOffData;
  });

  return processedDayOffs;
};

export const getDayOffsByUserId = async (userId: number) => {
  const dayOffs = await DayOffModel.findAll({
    where: { request_user_id: userId },
    include: [
      {
        model: UserModel,
        as: "request_user",
        required: false,
        attributes: getBasicUserAttributes(),
      },
      {
        model: UserModel,
        as: "assign_user",
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

  // Process PIPEDA decryption for dayOffs
  const processedDayOffs = dayOffs.map((dayOff: any) => {
    const dayOffData = dayOff.get({ plain: true });

    // Decrypt request_user data
    if (dayOffData.request_user) {
      dayOffData.request_user = decryptAndCleanUserData(dayOffData.request_user);
    }

    // Decrypt assign_user data
    if (dayOffData.assign_user) {
      dayOffData.assign_user = decryptAndCleanUserData(dayOffData.assign_user);
    }

    // Decrypt approve_user data
    if (dayOffData.approve_user) {
      dayOffData.approve_user = decryptAndCleanUserData(dayOffData.approve_user);
    }

    return dayOffData;
  });

  return processedDayOffs;
};

export const approveDayOff = async (
  id: number,
  approveUserId: number,
  remark?: string
) => {
  const dayOff = await DayOffModel.findByPk(id);
  if (!dayOff) throw new Error("Day off request not found");

  console.log("Day off request:", dayOff);
  console.log(
    "Approving day off request:",
    dayOff.id,
    "by user:",
    approveUserId
  );

  if (dayOff.status !== "Pending") {
    throw new Error("Only pending day off requests can be approved");
  }

  // Update day off request status to approved
  const updatedDayOff = await dayOff.update({
    status: "approved",
    approve_user_id: approveUserId,
    approve_date: new Date(),
    remark: remark || null,
    updated_by: approveUserId,
  });

  // Send notification to user
  await NotificationsService.sendNotification({
    title: "คำขอวันหยุดได้รับการอนุมัติ",
    message: `คำขอวันหยุดของคุณในวันที่ ${formatDateToThai(
      dayOff.day_off_date.toString()
    )} \nได้รับการอนุมัติแล้ว`,
    notification_type_id: 1,
    target_channel: "user",
    target_value: dayOff.request_user_id?.toString(),
    data: { dayOffId: dayOff.id, is_approved: true },
  });

  return updatedDayOff;
};

export const rejectDayOff = async (
  id: number,
  approveUserId: number,
  remark?: string
) => {
  const dayOff = await DayOffModel.findByPk(id);
  if (!dayOff) throw new Error("Day off request not found");

  console.log("Day off request:", dayOff);
  console.log(
    "Approving day off request:",
    dayOff.id,
    "by user:",
    approveUserId
  );

  // ตรวจสอบว่า status เป็น pending หรือไม่
  if (dayOff.status !== "Pending") {
    throw new Error("Only pending day off requests can be rejected");
  }

  // Update day off request status to rejected
  const updatedDayOff = await dayOff.update({
    status: "rejected",
    approve_user_id: approveUserId,
    approve_date: new Date(),
    remark: remark || null,
    updated_by: approveUserId,
  });

  // Send notification to user
  await NotificationsService.sendNotification({
    title: "คำขอวันหยุดถูกปฏิเสธ",
    message: `คำขอวันหยุดของคุณในวันที่ ${formatDateToThai(
      dayOff.day_off_date.toString()
    )} \nถูกปฏิเสธ${remark ? `: ${remark}` : ""}`,
    notification_type_id: 1,
    target_channel: "user",
    target_value: dayOff.request_user_id?.toString(),
    data: { dayOffId: dayOff.id, is_approved: false },
  });

  return updatedDayOff;
};
