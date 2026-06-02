import { Association, DataType, DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import PartnerTypeModel from "./PartnerTypeModel";
import AdsModel from "./AdsModel";
import CreditModel from "./CreditsModel";
import { PartnerStatusModel } from "./PartnerStatusModel";

export class AdPartnerModel extends Model {
    public id!: number;
    public partner_type_id!: number;
    public status_id!: string;
    public partner_name!: string;
    public contact_name!: string | null;
    public email!: string;
    public contact_email!: string | null;
    public country_code!: string;
    public phone_number!: string;
    public contact_phone_number!: string | null;
    public profile_picture!: string | null;
    public tax_id!: string | null;
    public created_by!: number | null;
    public updated_by!: number | null;
    public created_at!: Date;
    public updated_at!: Date;

    public partner_type?: PartnerTypeModel;
    public partner_status?: PartnerStatusModel;

    public static associations: {
        partner_type: Association<AdPartnerModel, PartnerTypeModel>;
        partner_status: Association<AdPartnerModel, PartnerStatusModel>;
    };
}

AdPartnerModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: "Primary kay: unique ID for each ad partner",
        },
        partner_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "Reference to the partner_type table",
        },
        status_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "Account status: active, inactive, etc.",
        },
        partner_name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: "Name of the ad partner",
        },
        contact_name: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: "Contact Name of the ad partner",
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: "Email address of the partner",
        },
        contact_email: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: "Contact Email address of the partner",
        },
        country_code: {
            type: DataTypes.STRING(10),
            allowNull: false,
            comment: "Country code for the phone number (e.g., +66)",
        },
        phone_number: {
            type: DataTypes.STRING(20),
            allowNull: false,
            comment: "Phone number of the partner",
        },
        contact_phone_number: {
            type: DataTypes.STRING(20),
            allowNull: true,
            comment: "Contact Phone number of the partner",
        },
        profile_picture: {
            type: DataTypes.STRING(1024),
            allowNull: true,
            comment: "URL to the profile picture of the partner",
        },
        tax_id: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: "Tax ID number (เลขประจำตัวผู้เสียภาษี)"
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "ID of the creator",
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "ID of the last updater",
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            comment: "Timestamp when the partner was created",
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            comment: "Timestamp when the partner was last updated",
        },
    },
    {
        sequelize,
        tableName: "ad_partners",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        comment: "Table of ad_partners records"
    }
);

// Association
AdPartnerModel.belongsTo(PartnerTypeModel, {
    as: "partner_type",
    foreignKey: "partner_type_id",
    targetKey: "id",
});

AdPartnerModel.belongsTo(PartnerStatusModel, {
    as: "partner_status",
    foreignKey: "status_id",
    targetKey: "id",
});

// AdPartnerModel.hasMany(AdsModel, {
//     foreignKey: 'partner_id',
//     as: 'ads',
//     sourceKey: 'id',
// });

// AdPartnerModel.hasMany(CreditModel, {
//     foreignKey: 'partner_id',
//     as: 'credits',
//     sourceKey: 'id',
// });

export default AdPartnerModel;