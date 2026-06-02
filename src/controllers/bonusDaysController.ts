import { Context } from "koa";
import dayjs from "dayjs";
import {
  getBonusDaysByMonth,
  createBonusDay,
  updateBonusDay,
  deleteBonusDay,
} from "../services/bonusDaysService";

export const getBonusDays = async (ctx: Context) => {
  let { year, month } = ctx.query;

  if (!year || !month) {
    const now = dayjs();
    year = now.year().toString();
    month = (now.month() + 1).toString().padStart(2, "0"); // month() เริ่มที่ 0
  }

  const formattedMonth = `${year}-${month}`;
  const bonusDays = await getBonusDaysByMonth(formattedMonth);

  ctx.body = bonusDays;
};

export const addBonusDay = async (ctx: Context) => {
  const data = ctx.request.body;

  if (!data.bonus_date || data.bonus_date === "") {
    data.bonus_date = null;
  }

  const bonusDay = await createBonusDay(data);
  ctx.body = bonusDay;
};

export const editBonusDay = async (ctx: Context) => {
  const id = ctx.params.id;
  const data = ctx.request.body;

  if (!data.bonus_date || data.bonus_date === "") {
    data.bonus_date = null;
  }

  const bonusDay = await updateBonusDay(Number(id), data);
  ctx.body = bonusDay;
};

export const removeBonusDay = async (ctx: Context) => {
  const id = ctx.params.id;
  await deleteBonusDay(Number(id));
  ctx.status = 204;
};
