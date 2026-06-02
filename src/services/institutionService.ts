import InstitutionModel from "../models/InstitutionModel";

export const getAllInstitutions = async () => {
  return await InstitutionModel.findAll({
    where: { is_active: true },
    order: [["id", "ASC"]],
  });
};

export const getInstitutionById = async (id: number) => {
  return await InstitutionModel.findByPk(id);
};

export const createInstitution = async (data: any, userId: number) => {
  return await InstitutionModel.create({
    ...data,
    created_by: userId,
    updated_by: userId,
    created_at: new Date(),
    updated_at: new Date(),
  });
};

export const updateInstitution = async (
  id: number,
  updates: any,
  userId: number
) => {
  const institution = await InstitutionModel.findByPk(id);
  if (!institution) throw new Error("Institution not found");
  return await institution.update({
    ...updates,
    updated_by: userId,
    updated_at: new Date(),
  });
};

export const deleteInstitution = async (id: number, userId: number) => {
  const institution = await InstitutionModel.findByPk(id);
  if (!institution) throw new Error("Institution not found");
  return await institution.update({
    is_active: false,
    updated_by: userId,
    updated_at: new Date(),
  });
};
