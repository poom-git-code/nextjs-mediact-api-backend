import { Association, DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import { ProvinceModel } from "./ProvinceModel";
import { DistrictModel } from "./DistrictModel";
import { SubdistrictModel } from "./SubdistrictModel";
import AddressTypeModel from "./AddressTypesModel";

export class AddressModel extends Model {
  public id!: number;
  public reference_id!: number;
  public address_type!: number | null;
  public address_line1!: string;
  public address_line2!: string | null;
  public country_code!: string | null;
  public province_code!: number | null;
  public district_code!: number | null;
  public subdistrict_code!: number | null;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
  public created_by!: number | null;
  public updated_by!: number | null;
  public province!: string;
  public district!: string;
  public sub_district!: string;
  public postal_code!: string;
  public country!: string;

  public province_info?: ProvinceModel;
  public district_info?: DistrictModel;
  public subdistrict_info?: SubdistrictModel;
  public address_type_info?: AddressTypeModel;

  public static associations: {
    province_info: Association<AddressModel, ProvinceModel>;
    district_info: Association<AddressModel, DistrictModel>;
    subdistrict_info: Association<AddressModel, SubdistrictModel>;
    address_type_info: Association<AddressModel, AddressTypeModel>;
  };
}

AddressModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary Key: Unique ID for each address",
    },
    reference_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "ID of User",
    },
    address_type: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Address type id (FK to address_types)",
    },
    address_line1: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Primary address line",
    },
    address_line2: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Secondary address line",
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
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Address status: true = active, false = inactive",
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
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "User ID of the creator who created this record",
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "User ID of the last updater who updated this record",
    },
    province: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    district: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    sub_district: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    postal_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "addresses",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "Table for storing addresses",
  }
);

// Associations for code lookup
AddressModel.belongsTo(ProvinceModel, {
  as: "province_info",
  foreignKey: "province_code",
  targetKey: "province_code",
});
AddressModel.belongsTo(DistrictModel, {
  as: "district_info",
  foreignKey: "district_code",
  targetKey: "district_code",
});
AddressModel.belongsTo(SubdistrictModel, {
  as: "subdistrict_info",
  foreignKey: "subdistrict_code",
  targetKey: "subdistrict_code",
});
AddressModel.belongsTo(AddressTypeModel, {
  as: "address_type_info",
  foreignKey: "address_type",
  targetKey: "id",
});

export default AddressModel;
