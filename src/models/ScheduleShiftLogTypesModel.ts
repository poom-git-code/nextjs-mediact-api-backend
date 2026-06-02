import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class ScheduleShiftLogTypesModel extends Model {
  public id!: number;
  public name!: string;
  public description!: string | null;
}

ScheduleShiftLogTypesModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary Key: Unique ID for each log type",
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: "Log type name (e.g., CHECK_IN, CHECK_OUT)",
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Description of the log type",
    },
  },
  {
    sequelize,
    tableName: "schedule_shift_log_types",
    timestamps: false,
    comment: "Table for schedule shift log types",
  }
);

export default ScheduleShiftLogTypesModel;
