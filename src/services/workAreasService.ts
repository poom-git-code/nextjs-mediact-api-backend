import WorkAreasModel from "../models/WorkAreasModel";
import JobTypeModel from "../models/JobTypeModel";
import FacilityTypeModel from "../models/FacilityTypesModel";
import { sequelize } from "../config/database";

export const createWorkArea = async (
  data: {
    province_code: number;
    district: string | number[];
    job_type_id?: number | number[] | null;
    facility_type_id?: number | number[] | null;
  },
  userId: number
) => {

  const districtCsv = Array.isArray(data.district) ? data.district.join(",") : String(data.district);

  // Convert arrays to CSV strings
  const jobTypeValue = data.job_type_id
    ? (Array.isArray(data.job_type_id) ? data.job_type_id.join(",") : data.job_type_id)
    : null;

  const facilityTypeValue = data.facility_type_id
    ? (Array.isArray(data.facility_type_id) ? data.facility_type_id.join(",") : data.facility_type_id)
    : null;

  return await WorkAreasModel.create({
    user_id: userId,
    province_code: data.province_code,
    district: districtCsv,
    job_type_id: jobTypeValue,
    facility_type_id: facilityTypeValue,
  });
};

export const updateWorkArea = async (
  id: number,
  updates: {
    province_code?: number;
    district?: string | number[];
    job_type_id?: number | number[] | null;
    facility_type_id?: number | number[] | null;
  },
  userId: number
) => {
  const wa = await WorkAreasModel.findByPk(id);
  if (!wa || Number(wa.get("user_id")) !== Number(userId)) throw new Error("Work area not found");

  const updateData: any = {};

  if (updates.province_code !== undefined) {
    updateData.province_code = updates.province_code;
  }

  if (updates.district !== undefined) {
    updateData.district = Array.isArray(updates.district)
      ? updates.district.join(",")
      : String(updates.district);
  }

  if (updates.job_type_id !== undefined) {
    updateData.job_type_id = updates.job_type_id
      ? (Array.isArray(updates.job_type_id) ? updates.job_type_id.join(",") : updates.job_type_id)
      : null;
  }

  if (updates.facility_type_id !== undefined) {
    updateData.facility_type_id = updates.facility_type_id
      ? (Array.isArray(updates.facility_type_id) ? updates.facility_type_id.join(",") : updates.facility_type_id)
      : null;
  }

  const updated = await wa.update(updateData);
  return updated;
};

export const deleteWorkArea = async (id: number, userId: number) => {
  const wa = await WorkAreasModel.findByPk(id);
  if (!wa || Number(wa.get("user_id")) !== Number(userId)) throw new Error("Work area not found");
  await wa.destroy();
  return true;
};

export const getAllWorkAreas = async () => {
  return await WorkAreasModel.findAll({ order: [["created_at", "DESC"]] });
};

export const getWorkAreasByUserId = async (userId: number) => {
  const rows = await WorkAreasModel.findAll({ where: { user_id: userId }, order: [["created_at", "DESC"]] });

  // Enrich each work area with job_type and facility_type when available
  const processed = await Promise.all(rows.map(async (r) => {
    const obj = typeof r.toJSON === 'function' ? r.toJSON() : r;

    let jobTypes: any[] = [];
    let facilityTypes: any[] = [];

    // job_type_id can be single id or comma-separated ids
    if (obj.job_type_id) {
      const ids = String(obj.job_type_id).split(',').map((s: string) => Number(s.trim())).filter((n: number) => !isNaN(n));
      if (ids.length > 0) {
        const jts = await JobTypeModel.findAll({ where: { id: ids } });
        jobTypes = jts.map((j) => j.toJSON());
      }
    }

    // facility_type_id can be single id or comma-separated ids
    if (obj.facility_type_id) {
      const ids = String(obj.facility_type_id).split(',').map((s: string) => Number(s.trim())).filter((n: number) => !isNaN(n));
      if (ids.length > 0) {
        const fts = await FacilityTypeModel.findAll({ where: { id: ids } });
        facilityTypes = fts.map((f) => f.toJSON());
      }
    }

    return {
      ...obj,
      job_types: jobTypes,
      facility_types: facilityTypes
    };
  }));

  return processed;
};
