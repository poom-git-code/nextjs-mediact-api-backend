
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class NotificationTypesModel extends Model {
  public id!: number;
  public type_code!: string;
  public type_name_th!: string;
  public type_name_en!: string;
  public sequence!: number;
  public is_active!: boolean;
  public created_at!: Date | null;
  public updated_at!: Date | null;
}

NotificationTypesModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: "รหัสสำหรับอ้างอิงในโปรแกรม เช่น SHIFT_ALERT, PROMOTION, SYSTEM",
    },
    type_name_th: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "ชื่อประเภทสำหรับแสดงผล (ภาษาไทย)",
    },
    type_name_en: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "ชื่อประเภทสำหรับแสดงผล (ภาษาอังกฤษ)",
    },
    sequence: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 99,
      comment: "ลำดับความสำคัญ (เลขน้อย = สำคัญมาก/แสดงก่อน)",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: "notification_types",
    timestamps: false,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "ตารางหลักเก็บประเภทการแจ้งเตือนและลำดับความสำคัญ",
    indexes: [
      {
        name: "idx_sequence",
        fields: ["sequence"],
      },
    ],
  }
);

export default NotificationTypesModel;
