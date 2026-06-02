import BonusDays from "../models/bonusDaysModel";
import { Op } from "sequelize";

export const getBonusDaysByMonth = async (month: string) => {
  const startDate = new Date(`${month}-01`);
  const endDate = new Date(startDate);
  endDate.setMonth(startDate.getMonth() + 1);

  return await BonusDays.findAll({
    where: {
      bonus_date: {
        [Op.between]: [startDate, endDate],
      },
    },
  });
};

export const createBonusDay = async (data: any) => {
  return await BonusDays.create(data);
};

export const updateBonusDay = async (id: number, data: any) => {
  const bonusDay = await BonusDays.findByPk(id);
  if (!bonusDay) throw new Error("Bonus day not found");

  return await bonusDay.update(data);
};

export const deleteBonusDay = async (id: number) => {
  const bonusDay = await BonusDays.findByPk(id);
  if (!bonusDay) throw new Error("Bonus day not found");

  return await bonusDay.destroy();
};
