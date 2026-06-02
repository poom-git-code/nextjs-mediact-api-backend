import HealthRegionsModel from "../models/HealthRegionsModel";
import HealthRegionProvincesModel from "../models/HealthRegionProvincesModel";
import ProvinceModel from "../models/ProvinceModel";

export const getAllHealthRegions = async (filters?: {
  include_provinces?: boolean;
  page?: number;
  limit?: number;
}) => {
  const { include_provinces = false, page, limit } = filters || {};

  const queryOptions: any = {
    order: [["id", "ASC"]],
  };

  // Include provinces if requested
  if (include_provinces) {
    queryOptions.include = [
      {
        model: HealthRegionProvincesModel,
        as: 'provinces',
        include: [
          {
            model: ProvinceModel,
            as: 'province',
            attributes: ['province_code', 'province_name_th', 'province_name_en']
          }
        ]
      }
    ];
  }

  // Get data with count for pagination
  if (page && limit) {
    const offset = (page - 1) * limit;
    queryOptions.limit = limit;
    queryOptions.offset = offset;
    
    const { count, rows } = await HealthRegionsModel.findAndCountAll(queryOptions);
    
    return {
      health_regions: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  // Get all data without pagination
  const healthRegions = await HealthRegionsModel.findAll(queryOptions);
  
  return healthRegions;
};

export const getHealthRegionById = async (id: number, include_provinces: boolean = false) => {
  const queryOptions: any = {
    where: { id }
  };

  if (include_provinces) {
    queryOptions.include = [
      {
        model: HealthRegionProvincesModel,
        as: 'provinces',
        include: [
          {
            model: ProvinceModel,
            as: 'province',
            attributes: ['province_code', 'province_name_th', 'province_name_en']
          }
        ]
      }
    ];
  }

  const healthRegion = await HealthRegionsModel.findOne(queryOptions);
  
  if (!healthRegion) {
    throw new Error("Health region not found");
  }

  return healthRegion;
};

export const createHealthRegion = async (data: any, userId: number) => {
  return await HealthRegionsModel.create({
    ...data,
    created_by: userId,
    updated_by: userId,
  });
};

export const updateHealthRegion = async (id: number, updates: any, userId: number) => {
  const healthRegion = await HealthRegionsModel.findByPk(id);
  
  if (!healthRegion) {
    throw new Error("Health region not found");
  }

  return await healthRegion.update({ 
    ...updates, 
    updated_by: userId 
  });
};

export const deleteHealthRegion = async (id: number, userId: number) => {
  const healthRegion = await HealthRegionsModel.findByPk(id);
  
  if (!healthRegion) {
    throw new Error("Health region not found");
  }

  await healthRegion.destroy();
  return { message: "Health region deleted successfully" };
};
