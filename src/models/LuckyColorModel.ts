import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class AuspiciousColorModel extends Model {
  public id!: number;
  public group_id!: number;
  public color_name!: string | null;
  public colors!: string;
  public type!: "lucky" | "unlucky";
  public created_at!: Date;
  public created_by!: string | null;
  public updated_at!: Date;
  public updated_by!: string | null;
}

AuspiciousColorModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary Key: Unique ID for each color",
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Color group identifier (0-9)",
    },
    color_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Name of the color",
    },
    colors: {
      type: DataTypes.CHAR(7),
      allowNull: false,
      comment: "Hex color code",
    },
    type: {
      type: DataTypes.ENUM("lucky", "unlucky"),
      allowNull: false,
      comment: "Type of color - lucky or unlucky",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: "Timestamp when record was created",
    },
    created_by: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "User who created the record",
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: "Timestamp when record was last updated",
    },
    updated_by: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "User who last updated the record",
    },
  },
  {
    sequelize,
    tableName: "auspicious_colors",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "Table for storing auspicious colors data",
  }
);

export default AuspiciousColorModel;
