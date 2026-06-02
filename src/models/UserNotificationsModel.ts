// src/models/user_notifications.model.ts
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class UserNotificationsModel extends Model {
  public id!: number;
  public notification_id!: number;
  public user_id!: number;
  public push_status!: "pending" | "success" | "failed";
  public push_token!: string | null;
  public is_in_app!: boolean;
  public is_read!: boolean;
  public read_at!: Date | null;
  public sent_at!: Date | null;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date | null;
  public updated_at!: Date | null;
}

UserNotificationsModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    notification_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    push_status: {
      type: DataTypes.ENUM("pending", "success", "failed"),
      defaultValue: "pending",
    },
    push_token: {
      type: DataTypes.STRING(512),
      defaultValue: null,
    },
    is_in_app: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    read_at: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    sent_at: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    created_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: "User ID of the creator",
    },
    updated_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: "User ID of the last updater",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "user_notifications",
    timestamps: false,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "Table for storing user notifications",
  }
);

export default UserNotificationsModel;