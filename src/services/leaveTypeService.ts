import LeaveTypeModel from "../models/LeaveTypeModel";

export const createLeaveType = async (data: any) => {
  return await LeaveTypeModel.create(data);
};

export const updateLeaveType = async (id: number, updates: Partial<LeaveTypeModel>) => {
  const leaveType = await LeaveTypeModel.findByPk(id);
  if (!leaveType) throw new Error("Leave type not found");
  return await leaveType.update(updates);
};

export const deleteLeaveType = async (id: number) => {
  const leaveType = await LeaveTypeModel.findByPk(id);
  if (!leaveType) throw new Error("Leave type not found");
  return await leaveType.destroy();
};

export const getLeaveTypeById = async (id: number) => {
  const leaveType = await LeaveTypeModel.findByPk(id);
  if (!leaveType) throw new Error("Leave type not found");
  return leaveType;
};

export const getAllLeaveTypes = async () => {
  return await LeaveTypeModel.findAll({ order: [["created_at", "DESC"]] });
};