import AddressModel from "../models/AddressesModel";
import ProvinceModel from "../models/ProvinceModel";
import DistrictModel from "../models/DistrictModel";
import SubdistrictModel from "../models/SubdistrictModel";
import AddressTypeModel from "../models/AddressTypesModel";

export const createAddress = async (
  data: Partial<AddressModel>,
  userId: number
) => {
  return await AddressModel.create({
    ...data,
    reference_id: data.reference_id,
    created_by: userId,
    updated_by: userId,
  });
};

export const createAddressMobile = async (
  data: Partial<AddressModel>,
  userId: number
) => {
  return await AddressModel.create({
    ...data,
    reference_id: userId,
    created_by: userId,
    updated_by: userId,
  });
};

export const updateAddress = async (
  id: number,
  updates: Partial<AddressModel>,
  userId: number
) => {
  const address = await AddressModel.findByPk(id);
  if (!address) {
    throw new Error("Address not found");
  }
  return await address.update({
    ...updates,
    updated_by: userId,
  });
};

export const deleteAddress = async (id: number, userId: number) => {
  const address = await AddressModel.findByPk(id);
  if (!address) throw new Error("Address not found");
  return await address.update({ is_active: false, updated_by: userId });
};

export const getAddressById = async (id: number) => {
  const address = await AddressModel.findAll({
    where: { id: id },
  });
  if (!address) {
    throw new Error("Address not found");
  }
  return address;
};

export const getAddressByUserId = async (id: number) => {
  const address = await AddressModel.findAll({
    where: { reference_id: id, is_active: true },
    order: [["created_at", "DESC"]],
  });
  if (!address) {
    throw new Error("Address not found");
  }
  return address;
};

export const getAllUserAddressInfo = async (userId: number) => {
  const addresses = await AddressModel.findAll({
    where: { reference_id: userId, is_active: true },
    order: [["created_at", "DESC"]],
    include: [
      {
        model: ProvinceModel,
        as: "province_info",
        required: false,
        attributes: ["id", "province_code", "province_name_th", "province_name_en"],
        // where: { province_code: { $col: "AddressModel.province_code" } }, // ใช้ province_code เทียบกับ field province ใน AddressModel
      },
      {
        model: DistrictModel,
        as: "district_info",
        required: false,
        attributes: ["id", "district_code", "district_name_th", "district_name_en", "postal_code"],
        // where: { district_code: { $col: "AddressModel.district_code" } },
      },
      {
        model: SubdistrictModel,
        as: "subdistrict_info",
        required: false,
        attributes: ["id", "subdistrict_code", "subdistrict_name_th", "subdistrict_name_en", "postal_code"],
        // where: { subdistrict_code: { $col: "AddressModel.sub_district_code" } },
      },
      {
        model: AddressTypeModel,
        as: "address_type_info",
        required: false,
        attributes: ["id", "name"],
      },
    ],
  });
  if (!addresses) {
    throw new Error("Address not found");
  }
    return addresses.map((addr: any) => {
    const {
      is_active,
      created_at,
      updated_at,
      created_by,
      updated_by,
      province,
      district,
      sub_district,
      address_type,
      ...rest
    } = addr.toJSON();
    return rest;
  });
};

export const getAddressByUserIdManagement = async (id: number) => {
  const address = await AddressModel.findAll({
    where: { reference_id: id },
    order: [["created_at", "DESC"]],
  });
  if (!address) {
    throw new Error("Address not found");
  }
  return address;
};

export const getAllAddresses = async () => {
  return await AddressModel.findAll({
    where: { is_active: true },
    order: [["created_at", "DESC"]],
  });
};

export const getAllAddressesManagement = async () => {
  return await AddressModel.findAll({
    order: [["updated_at", "DESC"]],
  });
};
