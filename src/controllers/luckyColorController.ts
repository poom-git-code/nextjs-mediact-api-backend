import { Context } from "koa";
import * as LuckyColorService from "../services/luckyColorService";

export const getMonthlyColors = async (ctx: Context) => {
  try {
    // Get user_id from authenticated token
    const userId = ctx.state.user?.id;
    if (!userId) {
      ctx.status = 401;
      ctx.body = { error: "Unauthorized: User ID not found in token" };
      return;
    }

    // Get current date for defaults
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11

    // Simple validation and parsing
    let targetYear = currentYear;
    let targetMonth = currentMonth;

    if (ctx.query.year) {
      const yearNum = parseInt(ctx.query.year as string, 10);
      if (!isNaN(yearNum) && yearNum >= 2020 && yearNum <= 2030) {
        targetYear = yearNum;
      }
    }

    if (ctx.query.month) {
      const monthNum = parseInt(ctx.query.month as string, 10);
      if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
        targetMonth = monthNum;
      }
    }

    // Get monthly colors data
    const monthlyColors = await LuckyColorService.getMonthlyLuckyColors(
      targetYear,
      targetMonth
    );

    // Return response
    ctx.body = {
      message: "Monthly colors retrieved successfully",
      year: targetYear,
      month: targetMonth,
      data: monthlyColors,
    };
  } catch (error) {
    ctx.status = 500;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "An unexpected error occurred" };
    }
  }
};

export const getTodayColors = async (ctx: Context) => {
  try {
    
    const userId = ctx.state.user?.id;
    if (!userId) {
      ctx.status = 401;
      ctx.body = { error: "Unauthorized: User ID not found in token" };
      return;
    }

    const currentDate = new Date();
    let targetYear = currentDate.getFullYear();
    let targetMonth = currentDate.getMonth() + 1;
    let targetDay = currentDate.getDate();

    if (ctx.query.year) {
      const yearNum = parseInt(ctx.query.year as string, 10);
      if (!isNaN(yearNum) && yearNum >= 2020 && yearNum <= 2030) {
        targetYear = yearNum;
      }
    }

    if (ctx.query.month) {
      const monthNum = parseInt(ctx.query.month as string, 10);
      if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
        targetMonth = monthNum;
      }
    }

    if (ctx.query.day) {
      const dayNum = parseInt(ctx.query.day as string, 10);
      if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) {
        targetDay = dayNum;
      }
    }

    // Get today's colors data
    const todayColors = await LuckyColorService.getTodayLuckyColors(
      targetYear,
      targetMonth,
      targetDay
    );

    // Return response
    ctx.body = {
      message: "Today's colors retrieved successfully",
      data: todayColors,
    };
  } catch (error) {
    ctx.status = 500;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "An unexpected error occurred" };
    }
  }
};

export const getYearlyColors = async (ctx: Context) => {
  try {
    // Get user_id from authenticated token
    const userId = ctx.state.user?.id;
    if (!userId) {
      ctx.status = 401;
      ctx.body = { error: "Unauthorized: User ID not found in token" };
      return;
    }

    // Get current date for defaults
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Simple validation and parsing
    let targetYear = currentYear;

    if (ctx.query.year) {
      const yearNum = parseInt(ctx.query.year as string, 10);
      if (!isNaN(yearNum) && yearNum >= 2020 && yearNum <= 2030) {
        targetYear = yearNum;
      }
    }

    // Get yearly colors data
    const yearlyColors = await LuckyColorService.getYearlyLuckyColors(
      targetYear
    );

    // Return response
    ctx.body = {
      message: "Yearly colors retrieved successfully",
      data: yearlyColors,
    };
  } catch (error) {
    ctx.status = 500;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "An unexpected error occurred" };
    }
  }
};

// Admin
