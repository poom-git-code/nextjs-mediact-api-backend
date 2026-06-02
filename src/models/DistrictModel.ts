import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class DistrictModel extends Model {
  public id!: number;
  public province_code!: number;
  public district_code!: number;
  public district_name_th!: string;
  public district_name_en!: string;
  public postal_code!: string;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
}

DistrictModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary key: unique ID for each district",
    },
    province_code: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Province code where this district belongs",
    },
    district_code: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      comment: "District code (standard code)",
    },
    district_name_th: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "District name in Thai",
    },
    district_name_en: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "District name in English",
    },
    postal_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: "Postal code for this district",
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
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "Timestamp when the shift type was created",
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "Timestamp when the shift type was last updated",
    },
  },
  {
    sequelize,
    tableName: "districts",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "Table for storing districts",
  }
);

export default DistrictModel;