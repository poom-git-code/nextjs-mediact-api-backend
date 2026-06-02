import EducationDegreeModel from '../models/EducationDegreesModel';

export const getAllEducationDegrees = async () => {
  return await EducationDegreeModel.findAll();
};

export const getEducationDegreeById = async (id: number) => {
  return await EducationDegreeModel.findByPk(id);
};

export const createEducationDegree = async (degreeData: any) => {
  return await EducationDegreeModel.create(degreeData);
};

export const updateEducationDegree = async (id: number, degreeData: any) => {
  const degree = await EducationDegreeModel.findByPk(id);
  if (!degree) return null;
  return await degree.update(degreeData);
};

export const deleteEducationDegree = async (id: number) => {
  const degree = await EducationDegreeModel.findByPk(id);
  if (!degree) return null;
  await degree.destroy();
  return degree;
};