import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class ProvinceModel extends Model {
  public id!: number;
  public province_code!: number;
  public province_name_th!: string;
  public province_name_en!: string;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
}

ProvinceModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary key: unique ID for each province",
    },
    province_code: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      comment: "Province code (standard code)",
    },
    province_name_th: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Province name in Thai",
    },
    province_name_en: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Province name in English",
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
    tableName: "provinces",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "Table for storing provinces",
  }
);

export default ProvinceModel;