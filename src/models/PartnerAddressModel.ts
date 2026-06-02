import { Association, DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import AdPartnerModel from "./AdPartnerModel";
import AddressTypeModel from "./AddressTypesModel";

export class PartnerAddressModel extends Model {
    public id!: number;
    public partner_id!: number;
    public address_type_id!: number;
    public address!: string;
    public country_code!: string | null;
    public province_code!: number | null;
    public district_code!: number | null;
    public subdistrict_code!: number | null;
    public province_name_th!: string | null;
    public province_name_en!: string | null;
    public district_name_th!: string | null;
    public district_name_en!: string | null;
    public subdistrict_name_th!: string | null;
    public subdistrict_name_en!: string | null;
    public postal_code!: string;
    public country_name_th!: string | null;
    public country_name_en!: string | null;
    public is_active!: boolean;
    public created_by!: number | null;
    public updated_by!: number | null;
    public created_at!: Date;
    public updated_at!: Date;

    public partner?: AdPartnerModel;
    public address_type?: AddressTypeModel;

    public static associations: {
        partner: Association<PartnerAddressModel, AdPartnerModel>;
        address_type: Association<PartnerAddressModel, AddressTypeModel>;
    };
}

PartnerAddressModel.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        partner_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        address_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        country_code: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        province_code: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        district_code: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        subdistrict_code: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        province_name_th: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: "Province name in Thai",
        },
        province_name_en: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: "Province name in English",
        },
        district_name_th: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: "District name in Thai",
        },
        district_name_en: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: "District name in English",
        },
        subdistrict_name_th: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: "Subdistrict name in Thai",
        },
        subdistrict_name_en: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: "Subdistrict name in English",
        },
        postal_code: {
            type: DataTypes.STRING(5),
            allowNull: false,
        },
        country_name_th: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: "Country name in Thai",
        },
        country_name_en: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: "Country name in English",
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'partner_address',
        timestamps: false,
        underscored: true,
    }
);

// Association
PartnerAddressModel.belongsTo(AdPartnerModel, {
    as: "partner",
    foreignKey: "partner_id",
    targetKey: "id",
});

PartnerAddressModel.belongsTo(AddressTypeModel, {
    as: "address_type",
    foreignKey: "address_type_id",
    targetKey: "id",
});

export default PartnerAddressModel;