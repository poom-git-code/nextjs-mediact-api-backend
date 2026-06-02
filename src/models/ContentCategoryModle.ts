import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class ContentCategoryModel extends Model {
  public id!: number;
  public name!: string;
  public description!: string;
  public is_active!: boolean;
  public sort_order!: number;
  public created_at!: Date;
  public updated_at!: Date;
  public created_by!: number;
  public updated_by!: number;
}

ContentCategoryModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary Key: Unique ID for each content category",
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      comment: "Category name (e.g., Relax, NEWS, การออมเงิน)",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Description of the content category",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Indicates whether the category is active or inactive",
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Order for sorting categories in UI",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: "Timestamp when the category was created",
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: "Timestamp when the category was last updated",
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
    tableName: "content_category",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "Master table for storing content categories",
  }
);

export default ContentCategoryModel;