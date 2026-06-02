import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import UserModel from "./UserModel";

export class UserEventStampModel extends Model {
  public id!: number;
  public booth_event_id!: number;
  public user_id!: number;
  public stamp_code!: string;
  public scanned_at!: Date;
  public is_redeemed!: boolean;
  public redeemed_at!: Date | null;
}

UserEventStampModel.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    booth_event_id: { type: DataTypes.BIGINT, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    stamp_code: { type: DataTypes.STRING(100), allowNull: false },
    scanned_at: { type: DataTypes.DATE, allowNull: false },
    is_redeemed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    redeemed_at: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  },
  {
    sequelize,
    tableName: "user_event_stamps",
    timestamps: false,
  }
);

export default UserEventStampModel;
