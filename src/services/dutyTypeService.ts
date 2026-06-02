import DutyTypeModel from '../models/DutyTypeModel';
import { Op } from 'sequelize';

export const createDutyType = async (data: any, userId: number) => {
  // Check if code already exists
  const existingDutyType = await DutyTypeModel.findOne({
    where: { code: data.code }
  });
  
  if (existingDutyType) {
    throw new Error('Duty type with this code already exists');
  }

  return await DutyTypeModel.create({
    ...data,
    created_by: userId,
    updated_by: userId,
  });
};

export const updateDutyType = async (id: number, updates: any, userId: number) => {
  const dutyType = await DutyTypeModel.findByPk(id);
  if (!dutyType) {
    throw new Error('Duty type not found');
  }

  // Check if code is being updated and already exists
  if (updates.code && updates.code !== dutyType.code) {
    const existingDutyType = await DutyTypeModel.findOne({
      where: { 
        code: updates.code,
        id: { [Op.ne]: id }
      }
    });
    
    if (existingDutyType) {
      throw new Error('Duty type with this code already exists');
    }
  }

  return await dutyType.update({ 
    ...updates, 
    updated_by: userId 
  });
};

export const deleteDutyType = async (id: number, userId: number) => {
  const dutyType = await DutyTypeModel.findByPk(id);
  if (!dutyType) {
    throw new Error('Duty type not found');
  }

  // Soft delete by setting is_active to false
  return await dutyType.update({ 
    is_active: false, 
    updated_by: userId 
  });
};

export const getDutyTypeById = async (id: number) => {
  const dutyType = await DutyTypeModel.findByPk(id);
  if (!dutyType) {
    throw new Error('Duty type not found');
  }
  return dutyType;
};

export const getDutyTypeByCode = async (code: string) => {
  const dutyType = await DutyTypeModel.findOne({
    where: { code }
  });
  if (!dutyType) {
    throw new Error('Duty type not found');
  }
  return dutyType;
};

export const getAllDutyTypes = async (filters: any = {}) => {
  const whereClause: any = {};
  
  // Apply filters
  if (filters.code) {
    whereClause.code = {
      [Op.like]: `%${filters.code}%`
    };
  }
  
  if (filters.name) {
    whereClause.name = {
      [Op.like]: `%${filters.name}%`
    };
  }
  
  if (filters.is_active !== undefined) {
    whereClause.is_active = filters.is_active;
  }

  // Global search across code, name, and description
  if (filters.search) {
    whereClause[Op.or] = [
      { code: { [Op.like]: `%${filters.search}%` } },
      { name: { [Op.like]: `%${filters.search}%` } },
      { description: { [Op.like]: `%${filters.search}%` } }
    ];
  }

  const options: any = {
    where: whereClause,
    order: [['id', 'ASC']],
    attributes: ['id', 'code', 'name', 'description', 'is_active', 'created_at', 'updated_at']
  };

  // Add pagination if provided
  if (filters.limit) {
    options.limit = filters.limit;
  }
  if (filters.offset) {
    options.offset = filters.offset;
  }

  return await DutyTypeModel.findAll(options);
};

export const getActiveDutyTypes = async () => {
  return await DutyTypeModel.findAll({
    where: { is_active: true },
    order: [['id', 'ASC']],
    attributes: ['id', 'code', 'name', 'description']
  });
};

export const bulkUpdateDutyTypes = async (dutyTypeIds: number[], updates: any, userId: number) => {
  // Validate that all duty types exist
  const dutyTypes = await DutyTypeModel.findAll({
    where: { id: { [Op.in]: dutyTypeIds } }
  });

  if (dutyTypes.length !== dutyTypeIds.length) {
    throw new Error('One or more duty types not found');
  }

  // Perform bulk update
  const result = await DutyTypeModel.update(
    { ...updates, updated_by: userId },
    { 
      where: { id: { [Op.in]: dutyTypeIds } },
      returning: true
    }
  );

  return result;
};

export const validateDutyTypeExists = async (codes: string[]) => {
  const dutyTypes = await DutyTypeModel.findAll({
    where: { 
      code: { [Op.in]: codes },
      is_active: true
    },
    attributes: ['id', 'code', 'name']
  });

  const foundCodes = dutyTypes.map(dt => dt.code);
  const missingCodes = codes.filter(code => !foundCodes.includes(code));

  return {
    valid: missingCodes.length === 0,
    found: dutyTypes,
    missing: missingCodes
  };
};

export const getDutyTypeCount = async (filters: any = {}) => {
  const whereClause: any = {};
  
  // Apply same filters as getAllDutyTypes
  if (filters.code) {
    whereClause.code = {
      [Op.like]: `%${filters.code}%`
    };
  }
  
  if (filters.name) {
    whereClause.name = {
      [Op.like]: `%${filters.name}%`
    };
  }
  
  if (filters.is_active !== undefined) {
    whereClause.is_active = filters.is_active;
  }

  if (filters.search) {
    whereClause[Op.or] = [
      { code: { [Op.like]: `%${filters.search}%` } },
      { name: { [Op.like]: `%${filters.search}%` } },
      { description: { [Op.like]: `%${filters.search}%` } }
    ];
  }

  return await DutyTypeModel.count({ where: whereClause });
};
