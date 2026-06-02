import { EducationInstitutionModel } from '../models/EducationInstitutionsModel';

// Get all education institutions
export const getAll = async () => {
  return await EducationInstitutionModel.findAll();
};

// Get a single education institution by ID
export const getById = async (id: string) => {
  return await EducationInstitutionModel.findByPk(id);
};

// Create a new education institution
export const create = async (data: any) => {
  return await EducationInstitutionModel.create(data);
};

// Update an existing education institution
export const update = async (id: string, data: any) => {
  const institution = await EducationInstitutionModel.findByPk(id);
  if (!institution) return null;
  await institution.update(data);
  return institution;
};

// Delete an education institution
export const remove = async (id: string) => {
  const institution = await EducationInstitutionModel.findByPk(id);
  if (!institution) return null;
  await institution.destroy();
  return true;
};