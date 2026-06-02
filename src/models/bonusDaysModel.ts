import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

class BonusDays extends Model {
  id!: number;
  bonus_date!: Date | null;
  weekday!: string;
  bonus_points!: number;
  description!: string;
  is_recurring!: boolean;
}

BonusDays.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    bonus_date: {
      type: DataTypes.DATE,
      allowNull: true,
      unique: true,
    },
    weekday: {
      type: DataTypes.ENUM("mon", "tue", "wed", "thu", "fri", "sat", "sun"),
      allowNull: true,
    },
    bonus_points: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    is_recurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "BonusDays",
    tableName: "bonus_days",
    timestamps: false,
  }
);

export default BonusDays;
