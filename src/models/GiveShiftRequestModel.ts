import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import UserModel from "./UserModel";
import ScheduleShiftModel from "./ScheduleShiftsModel";
import ShiftTypeModel from "./ShiftTypesModel";

export class GiveShiftRequestModel extends Model {
  public id!: number;
  public user_id!: number;
  public shift_id!: number;

  public original_shift_type_id!: number;
  public original_shift_type_name!: string;
  public target_user_id!: number;

  public target_approve_status!: "PENDING" | "APPROVED" | "DECLINED";
  public target_approve_date!: Date | null;

  public status!: "PENDING" | "APPROVED" | "DECLINED" | "CANCELLED";

  public remark!: string;
  public target_remark!: string;
  public approve_remark!: string;

  public approve_user_id!: number | null;
  public approve_date!: Date | null;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;

  public month!: number;
  public year!: number;
  public schedule_master_id!: number;

  public requester?: UserModel;
  public targetUser?: UserModel;
  public shift?: ScheduleShiftModel;

  public originalShiftType?: ShiftTypeModel;
}

GiveShiftRequestModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    shift_id: { type: DataTypes.INTEGER, allowNull: true },

    original_shift_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Original Shift Type ID before give away",
    },
    original_shift_type_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Original Shift Type Name snapshot",
    },

    target_user_id: { type: DataTypes.INTEGER, allowNull: false },
    target_approve_status: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "DECLINED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    target_approve_date: { type: DataTypes.DATE, allowNull: true },
    status: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "DECLINED", "CANCELLED"),
      allowNull: false,
      defaultValue: "PENDING",
    },

    remark: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Requester remark",
    },
    target_remark: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Target user remark",
    },
    approve_remark: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Supervisor remark",
    },

    approve_user_id: { type: DataTypes.INTEGER, allowNull: true },
    approve_date: { type: DataTypes.DATE, allowNull: true },
    month: { type: DataTypes.TINYINT, allowNull: true },
    year: { type: DataTypes.SMALLINT, allowNull: true },
    schedule_master_id: { type: DataTypes.INTEGER, allowNull: true },
    created_by: { type: DataTypes.INTEGER, allowNull: true },
    updated_by: { type: DataTypes.INTEGER, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "give_shift_requests",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

GiveShiftRequestModel.belongsTo(UserModel, {
  as: "requester",
  foreignKey: "user_id",
});
GiveShiftRequestModel.belongsTo(UserModel, {
  as: "targetUser",
  foreignKey: "target_user_id",
});
GiveShiftRequestModel.belongsTo(ScheduleShiftModel, {
  as: "shift",
  foreignKey: "shift_id",
});
GiveShiftRequestModel.belongsTo(UserModel, {
  as: "approve_user",
  foreignKey: "approve_user_id",
});

GiveShiftRequestModel.belongsTo(ShiftTypeModel, {
  as: "originalShiftType",
  foreignKey: "original_shift_type_id",
});

export default GiveShiftRequestModel;
