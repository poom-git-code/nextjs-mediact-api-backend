import { Context } from "koa";
import {
  handleCheckIn,
  checkBonusToday,
  getCheckInStats,
  getCheckInCalendar,
} from "../services/checkInService";
import { createLog, getLogs, getUserLogs } from "../services/checkInlogService";
import UserDailyCheckins from "../models/userDailyCheckinsModel";
import UserPoints from "../models/userPointsModel";

export const checkInStatus = async (ctx: Context) => {
  const userId = ctx.state.user?.id;

  if (!userId) {
    ctx.status = 400;
    ctx.body = { error: "User ID is required" };
    return;
  }

  // ✅ ใช้ date-only string แทน Date object เพื่อเปรียบเทียบวันที่อย่างแม่นยำ
  const today = new Date();
  const todayDateString = today.toISOString().split('T')[0]; // YYYY-MM-DD

  try {
    let userPoints = await UserPoints.findOne({ where: { user_id: userId } });
    if (!userPoints) {
      userPoints = await UserPoints.create({
        user_id: userId,
        total_points: 0,
        total_bonus_points: 0,
        current_streak: 0,
        max_streak: 0,
        last_check_in: null,
        updated_at: new Date(),
      });
    }

    const checkIns = await UserDailyCheckins.findAll({
      where: { user_id: userId },
      order: [["check_in_date", "ASC"]],
    });

    let calculatedStreak = 0;
    let maxStreak = 0;
    let previousDateString: string | null = null;

    // ✅ แปลงทุก check-in date เป็น date string และ deduplicate ในวันเดียวกัน
    const uniqueDates = new Set<string>();
    for (const checkIn of checkIns) {
      const dateString = new Date(checkIn.check_in_date).toISOString().split('T')[0];
      uniqueDates.add(dateString);
    }

    // ✅ คำนวณ streak จาก unique dates
    const sortedDates = Array.from(uniqueDates).sort();
    for (const dateString of sortedDates) {
      if (previousDateString) {
        // เช็คว่าเป็นวันถัดไปหรือไม่
        const prevDate = new Date(previousDateString);
        const currDate = new Date(dateString);
        const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / 86400000);
        
        if (diffDays === 1) {
          calculatedStreak++;
        } else {
          calculatedStreak = 1;
        }
      } else {
        calculatedStreak = 1;
      }

      maxStreak = Math.max(maxStreak, calculatedStreak);
      previousDateString = dateString;
    }

    if (previousDateString) {
      const lastCheckInDate = new Date(previousDateString);
      const todayDate = new Date(todayDateString);
      const daysSinceLastCheckIn = Math.floor((todayDate.getTime() - lastCheckInDate.getTime()) / 86400000);
      
      if (daysSinceLastCheckIn > 1) {
        calculatedStreak = 0;
      }
    } else {
      calculatedStreak = 0;
    }

    if (userPoints.current_streak !== calculatedStreak) {
      userPoints.current_streak = calculatedStreak;
    }

    if (userPoints.max_streak !== maxStreak) {
      userPoints.max_streak = maxStreak;
    }

    await userPoints.save();

    const checkIn = await UserDailyCheckins.findOne({
      where: {
        user_id: userId,
        check_in_date: todayDateString,
      },
    });

    ctx.body = {
      checkedIn: !!checkIn,
      currentStreak: userPoints.current_streak,
      maxStreak: userPoints.max_streak,
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      error: "Internal server error",
      details: (error as Error).message,
    };
  }
};

export const checkInToday = async (ctx: Context) => {
  const userId = ctx.state.user.id;
  if (!userId) {
    ctx.status = 400;
    ctx.body = { error: "User ID is required" };
    return;
  }

  // ✅ ใช้ date-only string เพื่อเปรียบเทียบวันที่อย่างแม่นยำ
  const today = new Date();
  const todayDateString = today.toISOString().split('T')[0]; // YYYY-MM-DD

  const existingCheckIn = await UserDailyCheckins.findOne({
    where: {
      user_id: userId,
      check_in_date: todayDateString,
    },
  });

  if (existingCheckIn) {
    ctx.status = 400;
    ctx.body = { error: "You have already checked in today." };
    return;
  }

  const userPoints = await UserPoints.findOne({ where: { user_id: userId } });
  if (!userPoints) {
    ctx.status = 404;
    ctx.body = { error: "User points not found" };
    return;
  }

  // ✅ แปลง last_check_in เป็น date string เพื่อเปรียบเทียบ
  const lastCheckInDateString = userPoints.last_check_in 
    ? new Date(userPoints.last_check_in).toISOString().split('T')[0]
    : null;

  // ✅ เช็คว่าเป็นวันถัดไปหรือไม่
  let isConsecutive = false;
  if (lastCheckInDateString) {
    const lastDate = new Date(lastCheckInDateString);
    const currentDate = new Date(todayDateString);
    const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / 86400000);
    isConsecutive = diffDays === 1;
  }

  if (isConsecutive) {
    userPoints.current_streak += 1;
  } else {
    userPoints.current_streak = 1;
  }

  userPoints.max_streak = Math.max(
    userPoints.max_streak,
    userPoints.current_streak
  );
  userPoints.last_check_in = today;
  await userPoints.save();

  const checkIn = await handleCheckIn(userId);
  ctx.body = {
    checkIn,
    currentStreak: userPoints.current_streak,
    maxStreak: userPoints.max_streak,
  };
};

export const checkInHistory = async (ctx: Context) => {
  const userId = ctx.state.user.id;
  const history = await getUserLogs(userId);
  ctx.body = history;
};

export const checkInStats = async (ctx: Context) => {
  const userId = ctx.state.user.id;
  const stats = await getCheckInStats(userId);
  ctx.body = stats;
};

export const checkInCalendar = async (ctx: Context) => {
  const userId = ctx.state.user.id;
  if (!userId) {
    ctx.status = 400;
    ctx.body = { error: "User ID is required" };
    return;
  }

  const currentYear = new Date().getFullYear();
  const yearParam = Array.isArray(ctx.query.year)
    ? ctx.query.year[0]
    : ctx.query.year;
  
  const year = yearParam ? parseInt(yearParam as string, 10) : currentYear;

  console.log("Year from request:", year);

  const { calendar, bonusDays } = await getCheckInCalendar(userId, year);
  ctx.body = { calendar, bonusDays };
};

export const manualCheckIn = async (ctx: Context) => {
  const { userId, date } = ctx.request.body;
  const checkIn = await handleCheckIn(userId);
  await createLog(userId, "manual-check-in", "Admin added manual check-in", {
    date,
  });
  ctx.body = checkIn;
};

export const getAllLogs = async (ctx: Context) => {
  const logs = await getLogs();
  ctx.body = logs;
};

export const getUserLogsById = async (ctx: Context) => {
  const userId = ctx.params.id;
  const logs = await getUserLogs(userId);
  ctx.body = logs;
};

export const getUserPoints = async (ctx: Context) => {
  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 400;
    ctx.body = { error: "User ID is required" };
    return;
  }

  try {
    const userPoints = await UserPoints.findOne({ where: { user_id: userId } });
    if (!userPoints) {
      ctx.status = 404;
      ctx.body = { error: "User points not found" };
      return;
    }

    ctx.body = {
      totalPoints: userPoints.total_points,
      total_bonus_points: userPoints.total_bonus_points,
      currentStreak: userPoints.current_streak,
      max_streak: userPoints.max_streak,
      lastCheckIn: userPoints.last_check_in,
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      error: "Internal server error",
      details: (error as Error).message,
    };
  }
};

export const deleteCheckIn = async (ctx: Context) => {
  const { id } = ctx.params;
  if (!id) {
    ctx.status = 400;
    ctx.body = { error: "Check-in ID is required" };
    return;
  }

  try {
    const deleted = await UserDailyCheckins.destroy({ where: { id } });
    if (!deleted) {
      ctx.status = 404;
      ctx.body = { error: "Check-in not found" };
      return;
    }

    ctx.body = { message: "Check-in deleted successfully" };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      error: "Internal server error",
      details: (error as Error).message,
    };
  }
};

export const updateCheckIn = async (ctx: Context) => {
  const { id } = ctx.params;
  const { points_earned, is_bonus_day, bonus_points } = ctx.request.body;

  if (!id) {
    ctx.status = 400;
    ctx.body = { error: "Check-in ID is required" };
    return;
  }

  try {
    const checkIn = await UserDailyCheckins.findOne({ where: { id } });
    if (!checkIn) {
      ctx.status = 404;
      ctx.body = { error: "Check-in not found" };
      return;
    }

    checkIn.points_earned = points_earned ?? checkIn.points_earned;
    checkIn.is_bonus_day = is_bonus_day ?? checkIn.is_bonus_day;
    checkIn.bonus_points = bonus_points ?? checkIn.bonus_points;
    await checkIn.save();

    ctx.body = { message: "Check-in updated successfully", checkIn };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      error: "Internal server error",
      details: (error as Error).message,
    };
  }
};
