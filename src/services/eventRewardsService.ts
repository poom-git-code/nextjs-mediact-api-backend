import EventRewardModel from "../models/EventRewardModel";
import BoothEventModel from "../models/BoothEventModel";

export const createReward = async (userId: number) => {
  // Find active Booth Event & last updated
  const activeEvent = await BoothEventModel.findOne({
    where: { is_active: true },
    order: [["updated_at", "DESC"]],
  });

  if (!activeEvent) {
    throw new Error("No active booth event found.");
  }

  const booth_event_id = activeEvent.id;

  const reward = await EventRewardModel.create({
    user_id: userId,
    booth_event_id,
    redeemed: true,
    redeemed_at: new Date(),
  });

  return reward;
};

export const getActiveRewardStatus = async (user_id: number) => {
  // Find active Booth Event
  const activeEvent = await BoothEventModel.findOne({
    where: { is_active: true },
    attributes: ["id"],
  });

  if (!activeEvent) {
    return { booth_event_id: null, redeemed: false, redeemed_at: null };
  }

  // Check if user has redeemed reward for the active event
  const reward = await EventRewardModel.findOne({
    where: {
      booth_event_id: activeEvent.id,
      user_id,
    },
  });

  return {
    booth_event_id: activeEvent.id,
    redeemed: !!reward,
    redeemed_at: reward?.redeemed_at || null,
  };
};

export const deleteRewardByBooth = async (
  booth_event_id: number,
  user_id: number
) => {
  const deleted = await EventRewardModel.destroy({
    where: {
      booth_event_id,
      user_id,
    },
  });

  if (deleted === 0) {
    throw new Error("ไม่พบ reward ที่จะลบ หรือคุณยังไม่ได้ redeem");
  }

  return true;
};

export const getRewardsByUser = async (user_id: number) => {
  return await EventRewardModel.findAll({ where: { user_id } });
};
