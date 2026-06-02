import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class DayOffModel extends Model {
  public id!: number;
  public request_user_id!: number;
  public assign_user_id!: number | null;
  public day_off_date!: Date;
  public month!: number;
  public year!: number;
  public schedule_master_id!: number;
  public status!: string;
  public approve_user_id!: number | null;
  public approve_date!: Date | null;
  public remark!: string | null;
  public reason!: string | null;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
}

DayOffModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    request_user_id: { type: DataTypes.INTEGER, allowNull: false },
    assign_user_id: { type: DataTypes.INTEGER, allowNull: true },
    day_off_date: { type: DataTypes.DATEONLY, allowNull: false },
    month: { type: DataTypes.TINYINT, allowNull: false },
    year: { type: DataTypes.SMALLINT, allowNull: false },
    schedule_master_id: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.STRING(255), allowNull: false },
    approve_user_id: { type: DataTypes.INTEGER, allowNull: true },
    approve_date: { type: DataTypes.DATE, allowNull: true },
    remark: { type: DataTypes.STRING(255), allowNull: true },
    reason: { 
      type: DataTypes.TEXT, 
      allowNull: true,
      comment: 'reason ใส่เหตุผลเพิ่มเติมสำหรับ day-off optional'
    },
    created_by: { type: DataTypes.INTEGER, allowNull: true },
    updated_by: { type: DataTypes.INTEGER, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "day_off",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "Table for day off requests",
  }
);

export default DayOffModel;