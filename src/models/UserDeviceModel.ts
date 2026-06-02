import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import UserModel from "./UserModel";

export class UserDeviceModel extends Model {
  public id!: number;
  public user_id!: number;
  public device_id!: string;
  public device_type!: "ios" | "android" | "web" | "desktop" | "other";
  public os_name!: string | null;
  public os_version!: string | null;
  public app_version!: string | null;
  public device_model!: string | null;
  public push_token!: string | null;
  public is_active!: boolean;
  public trusted_device!: boolean;
  public last_login_at!: Date | null;
  public ip_address!: string | null;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date | null;
  public updated_at!: Date | null;
}

UserDeviceModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary Key",
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: "Reference to users.id",
    },
    device_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Unique device identifier",
    },
    device_type: {
      type: DataTypes.ENUM("ios", "android", "web", "desktop", "other"),
      allowNull: false,
      comment: "Platform type",
    },
    os_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Operating System name",
    },
    os_version: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Operating System version",
    },
    app_version: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Mobile App version",
    },
    device_model: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Device model",
    },
    push_token: {
      type: DataTypes.STRING(512),
      allowNull: true,
      comment: "Push Notification token",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Is device currently active",
    },
    trusted_device: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Is this a trusted device",
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Last login date/time",
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: "Last known IP address",
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
    tableName: "user_devices",
    timestamps: false,
    comment: "Table for storing user devices",
    indexes: [
      {
        unique: true,
        fields: ["user_id", "device_id"],
        name: "unique_user_device",
      },
    ],
  }
);


UserDeviceModel.belongsTo(UserModel, {
  as: "user",
  foreignKey: "user_id",
  targetKey: "id"
});

export default UserDeviceModel;