import ShiftStatusModel from '../models/ShiftStatusModel';

export const createShiftStatus = async (data: any) => {
  return await ShiftStatusModel.create(data);
};

export const updateShiftStatus = async (id: number, updates: Partial<ShiftStatusModel>) => {
  const shiftStatus = await ShiftStatusModel.findByPk(id);
  if (!shiftStatus) {
    throw new Error('Shift Status not found');
  }
  return await shiftStatus.update(updates);
};

export const deleteShiftStatus = async (id: number) => {
  const shiftStatus = await ShiftStatusModel.findByPk(id);
  if (!shiftStatus) {
    throw new Error('Shift Status not found');
  }
  return await shiftStatus.destroy();
};

export const getShiftStatusById = async (id: number) => {
  const shiftStatus = await ShiftStatusModel.findByPk(id);
  if (!shiftStatus) {
    throw new Error('Shift Status not found');
  }
  return shiftStatus;
};

export const getAllShiftStatuses = async () => {
  return await ShiftStatusModel.findAll({
    order: [['name', 'ASC']],
  });
};

export const getActiveShiftStatuses = async () => {
  return await ShiftStatusModel.findAll({
    where: { is_active: true },
    order: [['name', 'ASC']],
  });
};

export const getShiftStatusByName = async (name: string) => {
  return await ShiftStatusModel.findOne({
    where: { name },
  });
};
