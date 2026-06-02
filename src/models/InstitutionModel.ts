import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class InstitutionModel extends Model {
  public id!: number;
  public name_th!: string;
  public name_en!: string;
  public country_code!: string;
  public is_active!: boolean;
  public created_at!: Date | null;
  public updated_at!: Date | null;
  public created_by!: number | null;
  public updated_by!: number | null;
}

InstitutionModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary Key: Unique ID for each institution",
    },
    name_th: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: "Institution name in Thai (e.g., Chulalongkorn University)",
    },
    name_en: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: "Institution name in English (e.g., Harvard University)",
    },
    country_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: "Country code referencing the Master Country Table (e.g., TH, US)",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Institution status: 1 = active, 0 = inactive",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Timestamp when the institution record was created",
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Timestamp when the institution record was last updated",
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
  },
  {
    sequelize,
    tableName: "institutions",
    timestamps: false,
    comment: "Table for storing institutions",
  }
);

export default InstitutionModel;