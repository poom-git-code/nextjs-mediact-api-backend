import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

class UserPoints extends Model {
  id!: number;
  user_id!: number;
  total_points!: number;
  total_bonus_points!: number;
  current_streak!: number;
  max_streak!: number;
  last_check_in!: Date;
  updated_at!: Date;
}

UserPoints.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    total_points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_bonus_points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    current_streak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    max_streak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    last_check_in: {
      type: DataTypes.DATE,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "user_points",
    timestamps: false,
  }
);

export default UserPoints;
