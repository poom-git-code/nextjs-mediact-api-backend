import ScheduleTemplateModel from '../models/ScheduleTemplatesModel';

export const createScheduleTemplate = async (data: any) => {
  return await ScheduleTemplateModel.create(data);
};

export const updateScheduleTemplate = async (id: number, updates: Partial<ScheduleTemplateModel>) => {
  const schedule = await ScheduleTemplateModel.findByPk(id);
  if (!schedule) {
    throw new Error('Schedule Template not found');
  }
  return await schedule.update(updates);
};

export const deleteScheduleTemplate = async (id: number) => {
  const schedule = await ScheduleTemplateModel.findByPk(id);
  if (!schedule) {
    throw new Error('Schedule Template not found');
  }
  return await schedule.destroy();
};

export const getScheduleTemplateById = async (id: number) => {
  const schedule = await ScheduleTemplateModel.findByPk(id);
  if (!schedule) {
    throw new Error('Schedule Template not found');
  }
  return schedule;
};

export const getAllScheduleTemplates = async () => {
  return await ScheduleTemplateModel.findAll();
};