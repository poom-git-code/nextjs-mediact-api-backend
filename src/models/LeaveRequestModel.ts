import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class LeaveRequestModel extends Model {
  public id!: number;
  public user_id!: number;
  public leave_type_id!: number;
  public shift_list!: string;
  public month!: number;
  public year!: number;
  public schedule_master_id!: number;
  public leave_date!: Date;
  public start_time!: string;
  public end_time!: string;
  public reason!: string | null;
  public status!: string;
  public approve_user_id!: number;
  public approve_date!: Date | null;
  public remark!: string | null;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
}

LeaveRequestModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    leave_type_id: { type: DataTypes.INTEGER, allowNull: false },
    shift_list: { type: DataTypes.STRING(255), allowNull: true },
    month: { type: DataTypes.TINYINT, allowNull: false },
    year: { type: DataTypes.SMALLINT, allowNull: false },
    schedule_master_id: { type: DataTypes.INTEGER, allowNull: true },
    leave_date: { type: DataTypes.DATEONLY, allowNull: false },
    start_time: { type: DataTypes.TIME, allowNull: false },
    end_time: { type: DataTypes.TIME, allowNull: false },
    reason: { 
      type: DataTypes.TEXT, 
      allowNull: true,
      comment: 'เหตุผลเพิ่มเติมสำหรับ leave request optional'
    },
    status: { type: DataTypes.STRING(255), allowNull: false },
    approve_user_id: { type: DataTypes.INTEGER, allowNull: true },
    approve_date: { type: DataTypes.DATE, allowNull: true },
    remark: { type: DataTypes.STRING(255), allowNull: true },
    created_by: { type: DataTypes.INTEGER, allowNull: true },
    updated_by: { type: DataTypes.INTEGER, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "leave_request",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "Table for leave requests",
  }
);

export default LeaveRequestModel;
