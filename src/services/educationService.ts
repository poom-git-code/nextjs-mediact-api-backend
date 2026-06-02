import EducationModel from '../models/EducationModel';

export const getAllEducations = async () => {
  return await EducationModel.findAll();
};

export const getEducationById = async (user_id: number) => {
  return await EducationModel.findAll({ where: { user_id } });
};

export const createEducation = async (educationData: any) => {
  return await EducationModel.create(educationData);
};

export const updateEducation = async (id: number, educationData: any) => {
  const education = await EducationModel.findByPk(id);
  if (!education) return null;
  return await education.update(educationData);
};

export const deleteEducation = async (id: number) => {
  const education = await EducationModel.findByPk(id);
  if (!education) return null;
  await education.destroy();
  return education;
};