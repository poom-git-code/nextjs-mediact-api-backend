import ScheduleTemplateShiftModel from '../models/ScheduleTemplateShiftsModel';

export const createScheduleTemplateShift = async (data: any) => {
  return await ScheduleTemplateShiftModel.create(data);
};

export const updateScheduleTemplateShift = async (id: number, updates: Partial<ScheduleTemplateShiftModel>) => {
  const shift = await ScheduleTemplateShiftModel.findByPk(id);
  if (!shift) {
    throw new Error('Schedule Template Shift not found');
  }
  return await shift.update(updates);
};

export const deleteScheduleTemplateShift = async (id: number) => {
  const shift = await ScheduleTemplateShiftModel.findByPk(id);
  if (!shift) {
    throw new Error('Schedule Template Shift not found');
  }
  return await shift.destroy();
};

export const getScheduleTemplateShiftById = async (id: number) => {
  const shift = await ScheduleTemplateShiftModel.findByPk(id);
  if (!shift) {
    throw new Error('Schedule Template Shift not found');
  }
  return shift;
};

export const getAllScheduleTemplateShifts = async () => {
  return await ScheduleTemplateShiftModel.findAll();
};