import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class GenderModel extends Model {
  public id!: number;
  public name!: string;
  public description!: string | null;
  public is_active!: boolean;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
}

GenderModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary Key: Unique ID for each gender",
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: "Gender name (e.g., Male, Female, Non-binary)",
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Description of the gender",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Status: 1 = active, 0 = inactive",
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "User ID of the creator",
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "User ID of the last updater",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "Record creation timestamp",
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "Record last update timestamp",
    },
  },
  {
    sequelize,
    tableName: "gender",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "Table for storing gender master data",
  }
);

export default GenderModel;