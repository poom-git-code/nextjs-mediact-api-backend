import UserEventStampModel from "../models/userEventStampsModel";
import BoothEventListModel from "../models/BoothListModel";
import BoothEventModel from "../models/BoothEventModel";
import UserModel from "../models/UserModel";
import { Op } from "sequelize";
import { getUserAttributes, decryptAndCleanUserData } from "../utils/encryptedFieldMapping";
import PipedaUserDataHandler from "../middleware/pipedaUserDataHandler";
import * as UserNotificationPreferenceService from "./userNotificationPreferenceService";

export const addStamp = async (user_id: number, stamp_code: string) => {
  const booth = await BoothEventListModel.findOne({
    where: { stamp_code },
  });

  if (!booth) {
    throw new Error("Invalid stamp code.");
  }

  const booth_event_id = booth.booth_event_id;

  const existingStamp = await UserEventStampModel.findOne({
    where: { user_id, booth_event_id, stamp_code },
  });

  if (existingStamp) {
    throw new Error("You have already scanned this booth.");
  }

  const newStamp = await UserEventStampModel.create({
    user_id,
    booth_event_id,
    stamp_code,
    scanned_at: new Date(),
    is_redeemed: false,
  });

  try {
    await UserNotificationPreferenceService.upsertUserPreference(
      user_id,
      'qr-booth-events',
      true
    );
  } catch (error) {
    console.error("Error upserting qr-booth-events preference:", error);
  }

  return newStamp;
};

export const getUserStamps = async (user_id: number) => {
  const activeEvents = await BoothEventModel.findAll({
    where: { is_active: true },
    attributes: ["id"],
  });

  const eventIds = activeEvents.map((event) => event.id);

  const uniqueStamps = await UserEventStampModel.findAll({
    where: {
      user_id,
      booth_event_id: eventIds,
    },
    attributes: ["stamp_code", "booth_event_id"],
    group: ["stamp_code", "booth_event_id"],
  });

  return uniqueStamps;
};

export const getUserStampsByUserId = async (user_id: number) => {
  // is_active events
  const activeEvents = await BoothEventModel.findAll({
    where: { is_active: true },
    attributes: ["id", "name", "total_stamps_required"],
  });

  if (activeEvents.length === 0) return [];

  const event = activeEvents[0]; // if only one active event, use it
  const booth_event_id = event.id;

  // booths
  const booths = await BoothEventListModel.findAll({
    where: { booth_event_id },
    attributes: ["id", "stamp_code", "booth_name"],
    order: [["id", "ASC"]],
  });

  // userStamps
  const userStamps = await UserEventStampModel.findAll({
    where: { user_id, booth_event_id },
    attributes: ["stamp_code"],
  });

  const userStampCodes = userStamps.map((s) => s.stamp_code);

  // boothList
  const boothList = booths.map((booth) => ({
    booth_id: booth.id,
    booth_name: booth.booth_name,
    stamp_code: booth.stamp_code,
    event_booth_name: event.name,
    has_stamp: userStampCodes.includes(booth.stamp_code),
  }));

  return {
    booth_event_id,
    total_required: event.total_stamps_required,
    user_total: userStampCodes.length,
    booths: boothList,
  };
};

export const deleteUserStampByUserId = async (user_id: number) => {
  return await UserEventStampModel.destroy({
    where: { user_id },
  });
};

export const getUserStampsManagement = async () => {
  // 1. หา active event
  const activeEvent = await BoothEventModel.findOne({
    where: { is_active: true },
  });
  if (!activeEvent) throw new Error("No active booth event found.");

  // 2. ดึง booth list ของ event นี้
  const boothList = await BoothEventListModel.findAll({
    where: { booth_event_id: activeEvent.id },
  });

  // 3. ดึง stamp ทั้งหมดของ event นี้
  const allStamps = await UserEventStampModel.findAll({
    where: { booth_event_id: activeEvent.id },
  });

  // 4. ดึง user_id ทั้งหมดที่เคยมี stamp
  const userIds = Array.from(new Set(allStamps.map((s) => s.user_id)));

  const users = await UserModel.findAll({
    where: {
      id: { [Op.in]: userIds }
    },
    attributes: getUserAttributes()
  })

  const decryptedUsers = await Promise.all(
    users.map(async (user) => await decryptAndCleanUserData(user))
  );

  const userMap = decryptedUsers.reduce((acc, user) => {
    acc[user.id] = user
    return acc
  }, {} as { [key: number]: UserModel })

  // 5. สร้างผลลัพธ์แบบ group by user
  const results = userIds.map((userId) => {
    const userStamps = allStamps.filter((s) => s.user_id === userId);

    const currentUser = userMap[userId]

    const booths = boothList
      .map((booth) => ({
        booth_id: booth.id,
        booth_name: booth.booth_name,
        stamp_code: booth.stamp_code,
        has_stamp: userStamps.some((s) => s.stamp_code === booth.stamp_code),
      }))
      .filter((booth) => booth.has_stamp);

    return {
      user_id: userId,
      first_name: currentUser?.first_name || null,
      last_name: currentUser?.last_name || null,
      phone_number: currentUser?.phone_number || null,
      stamps: {
        booth_event_id: activeEvent.id,
        total_required: activeEvent.total_stamps_required,
        user_total: userStamps.length,
        booths,
      },
    };
  });

  return results;
};
