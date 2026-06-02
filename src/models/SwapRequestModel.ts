import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import UserModel from "./UserModel";
import ScheduleShiftModel from "./ScheduleShiftsModel";

export class SwapRequestModel extends Model {
  [x: string]: any;
  public id!: number;
  public user_id!: number;
  public shift_id!: number;
  public target_user_id!: number;
  public swap_shift_id!: number;
  public month!: number;
  public year!: number;
  public schedule_master_id!: number;
  public target_approve_status!: "PENDING" | "APPROVED" | "DECLINED";
  public target_approve_date!: Date | null;
  public status!: string;
  public approve_user_id!: number;
  public approve_date!: Date | null;
  public remark!: string;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;

  public requester?: UserModel;
  public targetUser?: UserModel;
  public shift?: ScheduleShiftModel;
  public swapShift?: ScheduleShiftModel;
}

SwapRequestModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    shift_id: { type: DataTypes.INTEGER, allowNull: false },
    target_user_id: { type: DataTypes.INTEGER, allowNull: false },
    swap_shift_id: { type: DataTypes.INTEGER, allowNull: false },
    month: { type: DataTypes.TINYINT, allowNull: false },
    year: { type: DataTypes.SMALLINT, allowNull: false },
    schedule_master_id: { type: DataTypes.INTEGER, allowNull: false },
    target_approve_status: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "DECLINED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    target_approve_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วันที่ผู้ถูกขอตอบรับ/ปฏิเสธการแลกเวร",
    },
    status: { type: DataTypes.STRING(255), allowNull: false },
    approve_user_id: { type: DataTypes.INTEGER, allowNull: true },
    approve_date: { type: DataTypes.DATE, allowNull: true },
    remark: { type: DataTypes.STRING(255), allowNull: false },
    created_by: { type: DataTypes.INTEGER, allowNull: true },
    updated_by: { type: DataTypes.INTEGER, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "swap_request",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "Table for shift swap requests",
  }
);

SwapRequestModel.hasOne(UserModel, {
  as: "requester",
  foreignKey: "id",
  sourceKey: "user_id",
});
SwapRequestModel.hasOne(UserModel, {
  as: "targetUser",
  foreignKey: "id",
  sourceKey: "target_user_id",
});
SwapRequestModel.hasOne(ScheduleShiftModel, {
  as: "requestShift",
  foreignKey: "id",
  sourceKey: "shift_id",
});
SwapRequestModel.hasOne(ScheduleShiftModel, {
  as: "swapShift",
  foreignKey: "id",
  sourceKey: "swap_shift_id",
});

export default SwapRequestModel;
