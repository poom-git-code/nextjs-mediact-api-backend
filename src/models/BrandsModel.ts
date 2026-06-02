import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Brands extends Model {
  public id!: number;
  public name_th!: string;
  public name_en!: string | null;
  public logo_url!: string | null;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
}

Brands.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name_th: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ชื่อแบรนด์ (ภาษาไทย)",
    },
    name_en: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ชื่อแบรนด์ (ภาษาอังกฤษ)",
    },
    logo_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "URL รูปโลโก้ของแบรนด์",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Brands",
    tableName: "brands",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Brands;
