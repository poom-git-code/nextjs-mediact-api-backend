import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class UserGroupTagModel extends Model {
  public id!: number;
  public name!: string;
  public description!: string | null;
  public department_id!: number;
  public role_id!: number | null;
  public color_code!: string | null;
  public seq!: number | null;
  public is_active!: boolean;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
}

UserGroupTagModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary Key: Unique ID for each user group tag",
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Name of the user group tag",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Description of the user group tag",
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Reference to the department this group tag belongs to",
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Role that governs this group tag",
    },
    color_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: "Color code for UI display (e.g., #FF5733)",
    },
    seq: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Sequence number for ordering group tags",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Group tag status: true = active, false = inactive",
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
      defaultValue: DataTypes.NOW,
      comment: "Timestamp when the group tag was created",
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: "Timestamp when the group tag was last updated",
    },
  },
  {
    sequelize,
    tableName: "user_group_tags",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "Table for user group tags by department",
  }
);

export default UserGroupTagModel;
