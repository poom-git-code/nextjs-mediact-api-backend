import { Op } from "sequelize";
import FacilityHolidayModel from "../models/FacilityHolidayModel";

export const createFacilityHoliday = async (data: any) => {
  // 1. ตรวจสอบว่าวันที่ซ้ำหรือไม่ (สำหรับ Create)
  const existingHoliday = await FacilityHolidayModel.findOne({
    where: {
      facility_id: data.facility_id,
      holiday_date: data.holiday_date,
    },
  });

  // ถ้าเจอว่ามีอยู่แล้ว ให้ Throw Error ออกไปเลย
  if (existingHoliday) {
    throw new Error(
      `Holiday on date ${data.holiday_date} already exists for this facility.`
    );
  }

  // 2. ถ้าไม่ซ้ำ ก็สร้างตามปกติ
  return await FacilityHolidayModel.create(data);
};

export const getFacilityHolidayById = async (id: number) => {
  const holiday = await FacilityHolidayModel.findByPk(id);
  if (!holiday) throw new Error("Facility holiday not found");
  return holiday;
};

export const getFacilityHolidaysByFacilityId = async (facility_id: number) => {
  return await FacilityHolidayModel.findAll({ where: { facility_id } });
};

export const updateFacilityHoliday = async (id: number, updates: any) => {
  // 1. หาข้อมูลเดิมก่อน
  const holiday = await FacilityHolidayModel.findByPk(id);
  if (!holiday) throw new Error("Facility holiday not found");

  // 2. ถ้ามีการแก้ไขวันที่ หรือ Facility ต้องเช็คว่าไปซ้ำกับคนอื่นไหม
  if (updates.holiday_date || updates.facility_id) {
    const targetFacilityId = updates.facility_id || holiday.facility_id;
    const targetDate = updates.holiday_date || holiday.holiday_date;

    const duplicateHoliday = await FacilityHolidayModel.findOne({
      where: {
        facility_id: targetFacilityId,
        holiday_date: targetDate,
        id: { [Op.ne]: id }, // ไม่นับตัวเอง (Not Equal)
      },
    });

    // ถ้าเจอว่ามีคนอื่นใช้วันที่นี้อยู่แล้ว ให้ Throw Error
    if (duplicateHoliday) {
      throw new Error(
        `Holiday on date ${targetDate} already exists for this facility.`
      );
    }
  }

  // 3. อัปเดตข้อมูล
  return await holiday.update(updates);
};

export const deleteFacilityHoliday = async (id: number) => {
  const holiday = await FacilityHolidayModel.findByPk(id);
  if (!holiday) throw new Error("Facility holiday not found");
  return await holiday.destroy();
};
