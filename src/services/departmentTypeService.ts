import DepartmentTypeModel from '../models/DepartmentTypesModel';

export const createDepartmentType = async (data: any) => {
  return await DepartmentTypeModel.create(data);
};

export const updateDepartmentType = async (id: number, updates: Partial<DepartmentTypeModel>) => {
  const departmentType = await DepartmentTypeModel.findByPk(id);
  if (!departmentType) {
    throw new Error('Department Type not found');
  }
  return await departmentType.update(updates);
};

export const deleteDepartmentType = async (id: number) => {
  const departmentType = await DepartmentTypeModel.findByPk(id);
  if (!departmentType) {
    throw new Error('Department Type not found');
  }
  return await departmentType.destroy();
};

export const getDepartmentTypeById = async (id: number) => {
  const departmentType = await DepartmentTypeModel.findByPk(id);
  if (!departmentType) {
    throw new Error('Department Type not found');
  }
  return departmentType;
};

export const getAllDepartmentTypes = async () => {
  return await DepartmentTypeModel.findAll();
};