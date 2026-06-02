import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

class UserDailyCheckins extends Model {
  id!: number;
  user_id!: number;
  check_in_date!: Date;
  check_in_time!: Date;
  points_earned!: number;
  is_bonus_day!: boolean;
  bonus_points!: number;
  created_at!: Date;
}

UserDailyCheckins.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    check_in_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    check_in_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    points_earned: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
    },
    is_bonus_day: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    bonus_points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "user_daily_checkins",
    timestamps: false,
  }
);

export default UserDailyCheckins;
