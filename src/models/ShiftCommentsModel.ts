import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import ScheduleShiftModel from "./ScheduleShiftsModel";
import UserModel from "./UserModel";

interface ShiftCommentAttributes {
  id: number;
  shift_id: number;
  user_id: number;
  swap_request_id?: number | null;
  description: string;
  created_at?: Date;
  updated_at?: Date;
}

interface ShiftCommentCreationAttributes
  extends Optional<
    ShiftCommentAttributes,
    "id" | "created_at" | "updated_at"
  > {}

class ShiftComment
  extends Model<ShiftCommentAttributes, ShiftCommentCreationAttributes>
  implements ShiftCommentAttributes
{
  public id!: number;
  public shift_id!: number;
  public user_id!: number;
  public description!: string;
  public created_at!: Date;
  public updated_at!: Date;
  user: any;
  swap_request: any;
}

ShiftComment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    shift_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ScheduleShiftModel,
        key: "id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: UserModel,
        key: "id",
      },
    },
    swap_request_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "shift_comments",
    timestamps: true,
    updatedAt: "updated_at",
    createdAt: "created_at",
  }
);

ShiftComment.belongsTo(UserModel, {
  foreignKey: "user_id",
  as: "user",
});

export default ShiftComment;
