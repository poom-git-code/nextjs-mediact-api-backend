import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

class CheckInLogs extends Model {
  id!: number;
  user_id!: number;
  action!: string;
  description!: string;
  metadata!: object;
  created_at!: Date;
}

CheckInLogs.init(
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
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "check_in_logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

export default CheckInLogs;
