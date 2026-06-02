import MasterCountryModel from '../models/MasterCountriesModel';

export const createCountry = async (data: any, userId: number) => {
  return await MasterCountryModel.create({
    ...data,
    created_by: userId,
    updated_by: userId,
  });
};

export const updateCountry = async (id: number, updates: any, userId: number) => {
  const country = await MasterCountryModel.findByPk(id);
  if (!country) throw new Error('Country not found');
  return await country.update({ ...updates, updated_by: userId });
};

export const deleteCountry = async (id: number, userId: number) => {
  const country = await MasterCountryModel.findByPk(id);
  if (!country) throw new Error('Country not found');
  return await country.update({ is_active: false, updated_by: userId });
};

export const getCountryById = async (id: number) => {
  return await MasterCountryModel.findByPk(id);
};

export const getAllCountries = async () => {
  return await MasterCountryModel.findAll({ where: { is_active: true }, order: [['id', 'ASC']] });
};
