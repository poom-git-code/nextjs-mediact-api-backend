import JobCertificationModel from "../models/JobCertificationModel";

export const createJobCertification = async (data: any) => {
  return await JobCertificationModel.create(data);
};

export const updateJobCertification = async (id: number, updates: Partial<JobCertificationModel>) => {
  const cert = await JobCertificationModel.findByPk(id);
  if (!cert) throw new Error("Job certification not found");
  return await cert.update(updates);
};

export const deleteJobCertification = async (id: number) => {
  const cert = await JobCertificationModel.findByPk(id);
  if (!cert) throw new Error("Job certification not found");
  return await cert.destroy();
};

export const getJobCertificationById = async (id: number) => {
  const cert = await JobCertificationModel.findByPk(id);
  if (!cert) throw new Error("Job certification not found");
  return cert;
};

export const getAllJobCertifications = async () => {
  return await JobCertificationModel.findAll({ order: [["created_at", "DESC"]] });
};