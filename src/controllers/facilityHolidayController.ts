import { Context } from "koa";
import * as facilityHolidayService from "../services/facilityHolidayService";

export const createFacilityHoliday = async (ctx: Context) => {
  try {
    const holiday = await facilityHolidayService.createFacilityHoliday(
      ctx.request.body
    );
    ctx.status = 201;
    ctx.body = holiday;
  } catch (error: any) {
    // เช็คว่าถ้าเป็น error เรื่องข้อมูลซ้ำ ให้ส่ง 409 Conflict
    if (error.message.includes("already exists")) {
      ctx.status = 409;
    } else {
      ctx.status = 400;
    }
    ctx.body = { error: error.message };
  }
};

export const getFacilityHolidayById = async (ctx: Context) => {
  try {
    const holiday = await facilityHolidayService.getFacilityHolidayById(
      Number(ctx.params.id)
    );
    ctx.body = holiday;
  } catch (error: any) {
    ctx.status = 404;
    ctx.body = { error: error.message };
  }
};

export const getFacilityHolidaysByFacilityId = async (ctx: Context) => {
  try {
    const holidays =
      await facilityHolidayService.getFacilityHolidaysByFacilityId(
        Number(ctx.params.facility_id)
      );
    ctx.body = holidays;
  } catch (error: any) {
    ctx.status = 400;
    ctx.body = { error: error.message };
  }
};

export const updateFacilityHoliday = async (ctx: Context) => {
  try {
    const holiday = await facilityHolidayService.updateFacilityHoliday(
      Number(ctx.params.id),
      ctx.request.body
    );
    ctx.body = holiday;
  } catch (error: any) {
    // เช็คว่าถ้าเป็น error เรื่องข้อมูลซ้ำ ให้ส่ง 409 Conflict
    if (error.message.includes("already exists")) {
      ctx.status = 409;
    } else {
      ctx.status = 400;
    }
    ctx.body = { error: error.message };
  }
};

export const deleteFacilityHoliday = async (ctx: Context) => {
  try {
    await facilityHolidayService.deleteFacilityHoliday(Number(ctx.params.id));
    ctx.status = 204;
  } catch (error: any) {
    ctx.status = 404;
    ctx.body = { error: error.message };
  }
};
