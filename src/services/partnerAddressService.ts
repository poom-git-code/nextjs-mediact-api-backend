import AdPartnerModel from "../models/AdPartnerModel";
import PartnerAddressModel from "../models/PartnerAddressModel";

export const createPartnerAddress = async (data: any, userId: number) => {
    return await PartnerAddressModel.create({
        ...data,
        is_active: true,
        created_by: userId,
        updated_by: userId,
    });
};

export const getAllPartnerAddresses = async () => {
    return await PartnerAddressModel.findAll({
        order: [['id', 'ASC']],
    });
};

export const getPartnerAddressById = async (id: number) => {
    return await PartnerAddressModel.findOne({
        where: { id },
    });
};

export const getPartnerAddressByPartnerId = async (partnerId: number) => {
    const addresses = await PartnerAddressModel.findAll({
        where: { partner_id: partnerId },
        include: [
            {
                model: AdPartnerModel,
                as: "partner",
                attributes: ["partner_name"],
            },
        ],
        order: [
            ['is_active', 'DESC'],
        ],
    });

    const result = addresses.map((address) => ({
        id: address.id,
        partner_id: address.partner_id,
        partner_name: address.partner?.partner_name || null,
        address_type_id: address.address_type_id,
        address: address.address,
        country_code: address.country_code,
        province_code: address.province_code,
        district_code: address.district_code,
        subdistrict_code: address.subdistrict_code,
        province_name_th: address.province_name_th,
        province_name_en: address.province_name_en,
        district_name_th: address.district_name_th,
        district_name_en: address.district_name_en,
        subdistrict_name_th: address.subdistrict_name_th,
        subdistrict_name_en: address.subdistrict_name_en,
        country_name_th: address.country_name_th,
        country_name_en: address.country_name_en,
        postal_code: address.postal_code,
        is_active: address.is_active,
        created_at: address.created_at,
        updated_at: address.updated_at,
    }));

    return { data: result };
};


export const updatePartnerAddress = async (
    id: number,
    data: any,
    userId: number
) => {
    const address = await PartnerAddressModel.findOne({ where: { id } });
    if (!address) {
        throw new Error('Partner address not found');
    }

    await address.update({
        ...data,
        updated_by: userId,
    });

    return address;
};

export const deletePartnerAddress = async (id: number, userId: number) => {
    const address = await PartnerAddressModel.findOne({ where: { id } });
    if (!address) {
        throw new Error('Partner address not found');
    }

    await address.update({
        is_active: false,
        updated_by: userId,
    });

    return address;
};