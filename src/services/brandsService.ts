import Brands from "../models/BrandsModel";

// Helper function สำหรับแปลง response ตามภาษา
export const formatBrandWithLanguage = (
  brand: any,
  language: string = "th"
) => {
  const formatted = brand.toJSON ? brand.toJSON() : brand;
  return {
    ...formatted,
    name: language === "en" && formatted.name_en 
      ? formatted.name_en 
      : formatted.name_th,
  };
};

// Get all brands
export const getAllBrands = async (language: string = "th", activeOnly: boolean = false) => {
  const whereClause = activeOnly ? { is_active: true } : {};
  
  const brands = await Brands.findAll({
    where: whereClause,
    order: [["name_th", "ASC"]],
  });
  
  return brands.map((brand) => formatBrandWithLanguage(brand, language));
};

// Get brand by ID
export const getBrandById = async (id: number, language: string = "th") => {
  const brand = await Brands.findByPk(id);
  if (!brand) return null;
  return formatBrandWithLanguage(brand, language);
};

// Create brand
export const createBrand = async (data: {
  name_th: string;
  name_en?: string;
  logo_url?: string;
  is_active?: boolean;
}) => {
  const brand = await Brands.create({
    name_th: data.name_th,
    name_en: data.name_en || null,
    logo_url: data.logo_url || null,
    is_active: data.is_active ?? true,
  });

  return brand;
};

// Update brand
export const updateBrand = async (
  id: number,
  data: {
    name_th?: string;
    name_en?: string;
    logo_url?: string;
    is_active?: boolean;
  }
) => {
  const brand = await Brands.findByPk(id);
  if (!brand) throw new Error("Brand not found");

  brand.name_th = data.name_th ?? brand.name_th;
  brand.name_en = data.name_en ?? brand.name_en;
  brand.logo_url = data.logo_url ?? brand.logo_url;
  brand.is_active = data.is_active ?? brand.is_active;

  await brand.save();
  return brand;
};

// Delete brand (soft delete - set is_active to false)
export const deleteBrand = async (id: number, hardDelete: boolean = false) => {
  const brand = await Brands.findByPk(id);
  if (!brand) throw new Error("Brand not found");

  if (hardDelete) {
    await brand.destroy();
    return { message: "Brand deleted permanently" };
  } else {
    brand.is_active = false;
    await brand.save();
    return { message: "Brand deactivated successfully" };
  }
};

// Activate brand
export const activateBrand = async (id: number) => {
  const brand = await Brands.findByPk(id);
  if (!brand) throw new Error("Brand not found");

  brand.is_active = true;
  await brand.save();
  return brand;
};

// Search brands by name
export const searchBrands = async (
  query: string,
  language: string = "th",
  activeOnly: boolean = true
) => {
  const { Op } = require("sequelize");
  
  const whereClause: any = {
    [Op.or]: [
      { name_th: { [Op.like]: `%${query}%` } },
      { name_en: { [Op.like]: `%${query}%` } },
    ],
  };

  if (activeOnly) {
    whereClause.is_active = true;
  }

  const brands = await Brands.findAll({
    where: whereClause,
    order: [["name_th", "ASC"]],
  });

  return brands.map((brand) => formatBrandWithLanguage(brand, language));
};
