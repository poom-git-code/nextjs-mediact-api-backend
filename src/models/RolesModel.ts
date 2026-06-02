import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class RoleModel extends Model {
  static find(arg0: { name: string }) {
    throw new Error("Method not implemented.");
  }
  public id!: number;
  public name!: string;
  public description!: string | null;
  public user_view!: boolean;
  public sort_order!: number;
  public is_active!: boolean;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
}

RoleModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary Key: Unique ID for each role",
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: "Role name (e.g., Admin, Doctor, Nurse)",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Description of the role",
    },
    user_view: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "End-user can view role: true = yes, false = no",
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Sort order for displaying roles",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Role status: true = active, false = inactive",
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
      comment: "Timestamp when the role was created",
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      // onUpdate: DataTypes.NOW,
      comment: "Timestamp when the log entry was last updated",
    },
  },
  {
    sequelize,
    tableName: "roles",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "Table for user roles",
  }
);

export default RoleModel;
