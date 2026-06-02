import JobTypeModel from "../models/JobTypeModel";
import { Op } from "sequelize";

// Get all job types
export const getAllJobTypes = async (filters: {
  is_active?: boolean;
  search?: string;
}) => {
  const { is_active, search } = filters;
  
  const whereClause: any = {};
  
  if (is_active !== undefined) {
    whereClause.is_active = is_active;
  }
  
  if (search) {
    whereClause[Op.or] = [
      { job_type_code: { [Op.like]: `%${search}%` } },
      { job_type_name_th: { [Op.like]: `%${search}%` } },
      { job_type_name_en: { [Op.like]: `%${search}%` } },
    ];
  }
  
  return await JobTypeModel.findAll({
    where: whereClause,
    order: [["id", "ASC"]],
  });
};

// Get job type by ID
export const getJobTypeById = async (id: number) => {
  return await JobTypeModel.findByPk(id);
};

// Get job type by code
export const getJobTypeByCode = async (code: string) => {
  return await JobTypeModel.findOne({
    where: { job_type_code: code },
  });
};

// Create new job type
export const createJobType = async (data: {
  job_type_code: string;
  job_type_name_th: string;
  job_type_name_en: string;
  description?: string;
  is_active?: boolean;
}) => {
  // Check if job_type_code already exists
  const existingJobType = await getJobTypeByCode(data.job_type_code);
  if (existingJobType) {
    throw new Error(`Job type code '${data.job_type_code}' already exists`);
  }
  
  return await JobTypeModel.create({
    ...data,
    created_at: new Date(),
    updated_at: new Date(),
  });
};

// Update job type
export const updateJobType = async (
  id: number,
  updates: {
    job_type_code?: string;
    job_type_name_th?: string;
    job_type_name_en?: string;
    description?: string;
    is_active?: boolean;
  }
) => {
  const jobType = await JobTypeModel.findByPk(id);
  if (!jobType) {
    throw new Error("Job type not found");
  }
  
  // Check if job_type_code already exists (excluding current record)
  if (updates.job_type_code) {
    const existingJobType = await JobTypeModel.findOne({
      where: {
        job_type_code: updates.job_type_code,
        id: { [Op.ne]: id },
      },
    });
    if (existingJobType) {
      throw new Error(`Job type code '${updates.job_type_code}' already exists`);
    }
  }
  
  return await jobType.update({
    ...updates,
    updated_at: new Date(),
  });
};

// Delete job type (soft delete by setting is_active to false)
export const deleteJobType = async (id: number) => {
  const jobType = await JobTypeModel.findByPk(id);
  if (!jobType) {
    throw new Error("Job type not found");
  }
  
  return await jobType.update({
    is_active: false,
    updated_at: new Date(),
  });
};

// Hard delete job type
export const hardDeleteJobType = async (id: number) => {
  const jobType = await JobTypeModel.findByPk(id);
  if (!jobType) {
    throw new Error("Job type not found");
  }
  
  return await jobType.destroy();
};