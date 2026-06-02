import FacilityTypeModel from '../models/FacilityTypesModel';

export const createFacilityType = async (
  data: Partial<FacilityTypeModel>,
  createdBy: number
) => {
  return await FacilityTypeModel.create({
    ...data,
    created_by: createdBy,
    updated_by: createdBy,
  });
};

export const updateFacilityType = async (
  id: number,
  updates: Partial<FacilityTypeModel>,
  updatedBy: number
) => {
  const facilityType = await FacilityTypeModel.findByPk(id);
  if (!facilityType) {
    throw new Error("Facility Type not found");
  }
  return await facilityType.update({
    ...updates,
    updated_by: updatedBy,
  });
};

export const deleteFacilityType = async (id: number) => {
  const facilityType = await FacilityTypeModel.findByPk(id);
  if (!facilityType) {
    throw new Error('Facility Type not found');
  }
  return await facilityType.destroy();
};

export const getFacilityTypeById = async (id: number) => {
  const facilityType = await FacilityTypeModel.findByPk(id);
  if (!facilityType) {
    throw new Error('Facility Type not found');
  }
  return facilityType;
};

export const getAllFacilityTypes = async () => {
  return await FacilityTypeModel.findAll();
};