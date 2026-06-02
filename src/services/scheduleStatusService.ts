import ScheduleStatusModel from '../models/ScheduleStatusesModel';

export const createScheduleStatus = async (data: any) => {
  return await ScheduleStatusModel.create(data);
};

export const updateScheduleStatus = async (id: number, updates: Partial<ScheduleStatusModel>) => {
  const status = await ScheduleStatusModel.findByPk(id);
  if (!status) {
    throw new Error('Schedule Status not found');
  }
  return await status.update(updates);
};

export const deleteScheduleStatus = async (id: number) => {
  const status = await ScheduleStatusModel.findByPk(id);
  if (!status) {
    throw new Error('Schedule Status not found');
  }
  return await status.destroy();
};

export const getScheduleStatusById = async (id: number) => {
  const status = await ScheduleStatusModel.findByPk(id);
  if (!status) {
    throw new Error('Schedule Status not found');
  }
  return status;
};

export const getAllScheduleStatuses = async () => {
  return await ScheduleStatusModel.findAll();
};