import BoothEventModel from "../models/BoothEventModel";
import BoothEventListModel from "../models/BoothListModel";
import UserEventStampModel from "../models/userEventStampsModel";
import EventRewardModel from "../models/EventRewardModel";

export const createBoothEvent = async (
  data: Partial<BoothEventModel>,
  userId: number
) => {
  return await BoothEventModel.create({
    ...data,
    created_by: userId,
    updated_by: userId,
  });
};

export const updateBoothEvent = async (
  id: number,
  updates: Partial<BoothEventModel>,
  userId: number
) => {
  const event = await BoothEventModel.findByPk(id);
  if (!event) throw new Error("Event not found");
  return await event.update({
    ...updates,
    updated_by: userId,
  });
};

// export const deleteBoothEvent = async (id: number, userId: number) => {
//   const event = await BoothEventModel.findByPk(id);
//   if (!event) throw new Error("Event not found");
//   return await event.update({ is_active: false, updated_by: userId });
// };

export const deleteBoothEvent = async (eventId: number, userId: number) => {
  const event = await BoothEventModel.findByPk(eventId);
  if (!event) throw new Error("The activity you want to delete was not found.");

  await BoothEventListModel.destroy({ where: { booth_event_id: eventId } });
  await UserEventStampModel.destroy({ where: { booth_event_id: eventId } });
  await EventRewardModel.destroy({ where: { booth_event_id: eventId } });

  await BoothEventModel.destroy({ where: { id: eventId } });

  return true;
};

export const getBoothEventById = async (id: number) => {
  const event = await BoothEventModel.findByPk(id);
  if (!event) throw new Error("Event not found");
  return event;
};

export const getAllBoothEvents = async () => {
  return await BoothEventModel.findAll({
    where: { is_active: true },
    order: [["updated_at", "DESC"]],
  });
};

export const getAllBoothEventsManagement = async () => {
  return await BoothEventModel.findAll({
    order: [["updated_at", "DESC"]],
  });
};
