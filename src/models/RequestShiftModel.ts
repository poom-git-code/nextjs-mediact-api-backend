import { DataTypes, Model, Association } from "sequelize";
import { sequelize } from "../config/database";
import UserModel from "./UserModel";
import ShiftTypeModel from "./ShiftTypesModel";

export class RequestShiftModel extends Model {
  public id!: number;
  public request_user_id!: number;
  public request_date!: Date;
  public month!: number;
  public year!: number;
  public shift_type_id!: number;
  public status!: string;
  public approve_user_id!: number | null;
  public approve_date!: Date | null;
  public remark!: string | null; // เหตุผลการอนุมัติ/ปฏิเสธ
  public reason!: string | null; // เหตุผลการขอ
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;

  public request_user?: UserModel;
  public approve_user?: UserModel;
  public shift_type?: ShiftTypeModel;

  public static associations: {
    request_user: Association<UserModel, UserModel>;
    approve_user: Association<UserModel, UserModel>;
    shift_type: Association<ShiftTypeModel, ShiftTypeModel>;
  };
}

RequestShiftModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    request_user_id: { type: DataTypes.INTEGER, allowNull: false },
    request_date: { type: DataTypes.DATEONLY, allowNull: false },
    month: { type: DataTypes.TINYINT, allowNull: false },
    year: { type: DataTypes.SMALLINT, allowNull: false },
    shift_type_id: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "Pending",
    },
    approve_user_id: { type: DataTypes.INTEGER, allowNull: true },
    approve_date: { type: DataTypes.DATE, allowNull: true },
    remark: { type: DataTypes.STRING(255), allowNull: true },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "เหตุผลเพิ่มเติมสำหรับการขอขึ้นเวร",
    },
    created_by: { type: DataTypes.INTEGER, allowNull: true },
    updated_by: { type: DataTypes.INTEGER, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "request_shifts",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "Table for shift requests (ขอขึ้นเวร)",
  }
);

// Associations
RequestShiftModel.belongsTo(UserModel, {
  as: "request_user",
  foreignKey: "request_user_id",
});
RequestShiftModel.belongsTo(UserModel, {
  as: "approve_user",
  foreignKey: "approve_user_id",
});
RequestShiftModel.belongsTo(ShiftTypeModel, {
  as: "shift_type",
  foreignKey: "shift_type_id",
});

export default RequestShiftModel;
