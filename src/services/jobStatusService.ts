import JobStatusModel from "../models/JobStatusModel";

export const createJobStatus = async (data: any) => {
  return await JobStatusModel.create(data);
};

export const updateJobStatus = async (id: number, updates: Partial<JobStatusModel>) => {
  const status = await JobStatusModel.findByPk(id);
  if (!status) throw new Error("Job status not found");
  return await status.update(updates);
};

export const deleteJobStatus = async (id: number) => {
  const status = await JobStatusModel.findByPk(id);
  if (!status) throw new Error("Job status not found");
  return await status.destroy();
};

export const getJobStatusById = async (id: number) => {
  const status = await JobStatusModel.findByPk(id);
  if (!status) throw new Error("Job status not found");
  return status;
};

export const getAllJobStatuses = async () => {
  return await JobStatusModel.findAll({ order: [["created_at", "DESC"]] });
};