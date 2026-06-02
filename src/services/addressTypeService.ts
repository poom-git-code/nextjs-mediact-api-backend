import AddressTypeModel from "../models/AddressTypesModel";

export const createAddressType = async (
  data: Partial<AddressTypeModel>,
  createdBy: number
) => {
  return await AddressTypeModel.create({
    ...data,
    created_by: createdBy,
    updated_by: createdBy,
  });
};

export const updateAddressType = async (
  id: number,
  updates: Partial<AddressTypeModel>,
  updatedBy: number
) => {
  const addressType = await AddressTypeModel.findByPk(id);
  if (!addressType) {
    throw new Error("Address Type not found");
  }
  return await addressType.update({
    ...updates,
    updated_by: updatedBy,
  });
};

export const deleteAddressType = async (id: number, userId: number) => {
  const addressType = await AddressTypeModel.findByPk(id);
  if (!addressType) throw new Error("Category not found");
  return await addressType.update({ is_active: false, updated_by: userId });
};

export const getAddressTypeById = async (id: number) => {
  const addressType = await AddressTypeModel.findByPk(id);
  if (!addressType) {
    throw new Error("Address Type not found");
  }
  return addressType;
};

export const getAllAddressTypes = async () => {
  return await AddressTypeModel.findAll({
    where: { is_active: true },
    order: [["updated_at", "DESC"]],
  });
};

export const getAllAddressTypesManagement = async () => {
  return await AddressTypeModel.findAll({
    order: [["updated_at", "DESC"]],
  });
};
