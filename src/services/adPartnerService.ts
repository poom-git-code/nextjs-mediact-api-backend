import PartnerTypeModel from "../models/PartnerTypeModel";
import AdPartnerModel from "../models/AdPartnerModel";
import { PartnerStatusModel } from "../models/PartnerStatusModel";
import * as CreditService from './creditService';
import { sequelize } from '../config/database';

export const createAdPartner = async (data: any, userId: number) => {
    return await sequelize.transaction(async (transaction) => {
        // 1. Create Ad Partner
        const partner = await AdPartnerModel.create({
            ...data,
            created_by: userId,
            updated_by: userId
        }, { transaction })

        // 2. Create Credit, total_credits = 0
        await CreditService.createCredits(
            {
                user_id: partner.id,
                total_credits: 0
            },
            userId,
            transaction
        )

        return partner
    })
}

export const updateAdPartner = async (id: number, updates: Partial<AdPartnerModel>, userId: number) => {
    const partner = await AdPartnerModel.findByPk(id);
    if (!partner) {
        throw new Error("Partner not found");
    }

    return await partner.update({
        ...updates,
        updated_by: userId
    });
};

export const deleteAdPartner = async (id: number, userId: number) => {
    const partner = await AdPartnerModel.findByPk(id);
    if (!partner) {
        throw new Error("Partner not found");
    }

    // 1. Find the inactive status ID from partner_status table
    const inactiveStatus = await PartnerStatusModel.findOne({
        where: { name: 'Inactive', is_active: true },
    });

    if (!inactiveStatus) {
        throw new Error("Inactive status not found in partner_status table");
    }

    // 2. Update partner's status_id with the inactive status ID
    return await partner.update({
        status_id: inactiveStatus.id,
        updated_by: userId
    });
};

export const getAdPartnerById = async (id: number) => {
    const partner = await AdPartnerModel.findByPk(id, {
        include: [
            {
                model: PartnerTypeModel,
                as: "partner_type",
                attributes: ["name"]
            },
            {
                model: PartnerStatusModel,
                as: "partner_status",
                attributes: ["name"]
            },
        ],
    });

    if (!partner) {
        throw new Error("Partner not found");
    }
    return {
        id: partner.id,
        partner_type_id: partner.partner_type_id,
        partner_type: partner.partner_type?.name || null,
        status_id: partner.status_id,
        partner_status: partner.partner_status?.name || null,
        partner_name: partner.partner_name,
        contact_name: partner.contact_name,
        email: partner.email,
        contact_email: partner.contact_email,
        country_code: partner.country_code,
        phone_number: partner.phone_number,
        contact_phone_number: partner.contact_phone_number,
        profile_picture: partner.profile_picture,
        tax_id: partner.tax_id,
        created_by: partner.created_by,
        created_at: partner.created_at,
        updated_by: partner.updated_by,
        updated_at: partner.updated_at,
    };
};

export const getAllAdPartner = async () => {
    return await AdPartnerModel.findAll({
        order: [["created_at", "DESC"]]
    });
};

// export const updateAdPartnerStatus = async (id: number) => {
//     const partner = await AdPartnerModel.findByPk(id);
//     if (!partner) {
//         throw new Error("Partner not found");
//     }
//     return await partner.update({ status: "inactive" });
// };

// export const getAdPartnerInfo = async (id: number) => {
//     const partner = await AdPartnerModel.findByPk(id, {
//         include: [
//             {
//                 model: PartnerTypeModel,
//                 as: "partner_type",
//                 attributes: ["name"]
//             },
//         ],
//     });

//     if (!partner) {
//         throw new Error("Partner not found");
//     }

//     return {
//         partner: {
//             id: partner.id,
//             partner_type: partner.partner_type,
//             partner_name: partner.partner_name,
//             email: partner.email,
//             country_code: partner.country_code,
//             phone_number: partner.phone_number,
//             profile_picture: partner.profile_picture,
//             reference_file: partner.reference_file,
//             status: partner.partner_status,
//             address: partner.address
//         },
//     };
// };