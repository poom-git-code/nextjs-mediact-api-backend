// src/models/notifications.model.ts
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import NotificationTypesModel from "./NotificationTypesModel";

export class NotificationsModel extends Model {
  public id!: number;
  public title!: string;
  public message!: string;
  public notification_type_id!: number | null;
  public data_payload!: object | null;
  public target_channel!: "user" | "role" | "group" | "broadcast" | "topic";
  public target_value!: string | null;
  public channels!: object | null;
  public scheduled_at!: Date | null;
  public sent_at!: Date | null;
  public status!: "pending" | "processing" | "sent" | "failed";
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date | null;
  public updated_at!: Date | null;
}

NotificationsModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary Key",
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    notification_type_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: "FK to notification_types",
    },
    data_payload: {
      type: DataTypes.JSON,
      defaultValue: null,
    },
    target_channel: {
      type: DataTypes.ENUM("user", "role", "group", "broadcast", "topic"),
      allowNull: false,
    },
    target_value: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    channels: {
      type: DataTypes.JSON,
      defaultValue: null,
    },
    scheduled_at: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    sent_at: {
      type: DataTypes.DATE,
      defaultValue: null,
    },

    // --- ADDED ---
    status: {
      type: DataTypes.ENUM("pending", "processing", "sent", "failed"),
      allowNull: false,
      defaultValue: "pending",
      comment: "Processing status of the notification",
    },
    // -------------

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
      comment: "Created timestamp",
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      comment: "Updated timestamp",
    },
  },
  {
    sequelize,
    tableName: "notifications",
    timestamps: false,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "Table for storing company notifications",
  }
);

// Define associations
NotificationsModel.belongsTo(NotificationTypesModel, {
  foreignKey: "notification_type_id",
  as: "notification_type",
  constraints: false,
});

NotificationTypesModel.hasMany(NotificationsModel, {
  foreignKey: "notification_type_id",
  as: "notifications",
  constraints: false,
});

export default NotificationsModel;
