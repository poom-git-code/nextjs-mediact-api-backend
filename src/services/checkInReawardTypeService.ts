import RewardTypes from "../models/checkinRewardTypesModel";

export const formatRewardTypeWithLanguage = (
  rewardType: any,
  language: string = "th"
) => {
  const formatted = rewardType.toJSON ? rewardType.toJSON() : rewardType;
  return {
    ...formatted,
    name: language === "en" ? formatted.name_en : formatted.name_th,
  };
};

export const getRewardTypes = async (language: string = "th") => {
  const rewardTypes = await RewardTypes.findAll();
  return rewardTypes.map((rt) => formatRewardTypeWithLanguage(rt, language));
};

export const getRewardTypeById = async (id: number, language: string = "th") => {
  const rewardType = await RewardTypes.findByPk(id);
  if (!rewardType) return null;
  return formatRewardTypeWithLanguage(rewardType, language);
};

export const createRewardType = async (
  data: {
    name_th: string;
    name_en: string;
    description?: string;
    is_active?: boolean;
    created_by?: number;
    updated_by?: number;
  },
  userId: number
) => {
  return await RewardTypes.create({
    ...data,
    created_by: userId,
    updated_by: userId,
  });
};

export const updateRewardType = async (
  id: number,
  data: {
    name_th?: string;
    name_en?: string;
    description?: string;
    is_active?: boolean;
    updated_by?: number;
  }
) => {
  const rewardType = await RewardTypes.findByPk(id);
  if (!rewardType) throw new Error("Reward type not found");

  Object.assign(rewardType, data);
  await rewardType.save();
  return rewardType;
};

export const deleteRewardType = async (id: number) => {
  const rewardType = await RewardTypes.findByPk(id);
  if (!rewardType) throw new Error("Reward type not found");

  await rewardType.destroy();
  return { message: "Reward type deleted successfully" };
};
