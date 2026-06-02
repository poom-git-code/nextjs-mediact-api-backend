import { Context } from "koa";
import * as UserService from "../services/userService";
import * as UserRoleService from "../services/userRoleService";
import { getUsersWithRoleAndSchedules, getUserForSwap, getUserForTransfer } from "../services/medicalStaffService";
import { schedule } from "node_modules/node-cron/dist/cjs/node-cron";

export const getUserDetailsWithSchedulesByRole = async (ctx: Context) => {
  try {
    const userId = ctx.state.user.id;
    const scheduleId = ctx.params.id;

    console.log("userId:", userId);
    console.log("scheduleId:", scheduleId);

    if (!userId || !scheduleId) {
      ctx.status = 400;
      ctx.body = { error: "User ID and Schedule ID are required" };
      return;
    }

    const usersWithSchedules = await getUsersWithRoleAndSchedules(
      userId,
      Number(scheduleId)
    );

    if (!usersWithSchedules || usersWithSchedules.length === 0) {
      ctx.status = 404;
      ctx.body = { error: "No users or schedules found for the given user" };
      return;
    }

    // ✅ คุณจะได้ list ของ "เพื่อนร่วมเวร" พร้อม schedules อยู่แล้ว
    ctx.body = { usersWithSchedules };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: (error as Error).message || "An error occurred" };
  }
};

export const getUserForSwapController = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    const { date } = ctx.request.body as { date: string };

    if (!userId) {
      ctx.status = 401;
      ctx.body = { error: "User ID not found in token" };
      return;
    }

    if (!date) {
      ctx.status = 400;
      ctx.body = { error: "Date is required" };
      return;
    }

    const usersWithSchedules = await getUserForSwap(userId, date);

    ctx.status = 200;
    ctx.body = { 
      date,
      total_users: usersWithSchedules.length,
      users: usersWithSchedules 
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: (error as Error).message || "An error occurred" };
  }
};

export const getUserForTransferController = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    const { scheduleId } = ctx.request.body as { scheduleId: number };

    if (!userId) {
      ctx.status = 401;
      ctx.body = { error: "User ID not found in token" };
      return;
    }

    if (!scheduleId) {
      ctx.status = 400;
      ctx.body = { error: "Schedule ID is required" };
      return;
    }

    const users = await getUserForTransfer(userId, scheduleId);

    ctx.status = 200;
    ctx.body = { 
      scheduleId,
      total_users: users.length,
      users 
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: (error as Error).message || "An error occurred" };
  }
};
