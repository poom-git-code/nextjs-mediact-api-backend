import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import ScheduleShiftModel from "./ScheduleShiftsModel";
import UserModel from "./UserModel";
import ScheduleShiftLogTypesModel from "./ScheduleShiftLogTypesModel";
import WorkTypeModel from "./WorkTypeModel";

export class ScheduleShiftLogsModel extends Model {
  public id!: number;
  public schedule_shift_id!: number;
  public user_id!: number;
  public latitude!: number | null;
  public longitude!: number | null;
  public log_type_id!: number;
  public work_type_id!: number;
  public log_timestamp!: Date;
  // public updated_by!: number | null;
  public remarks!: string | null;
}

ScheduleShiftLogsModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary Key: Unique ID for each schedule shift log",
    },
    schedule_shift_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Foreign key reference to schedule_shifts table",
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "FK to the users table, indicating the employee for this log",
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
      comment: "Latitude of the log location",
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      comment: "Longitude of the log location",
    },
    log_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "FK to the log_types table",
    },
    work_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "FK to the work_types table, e.g., Normal, OT",
    },
    log_timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "Timestamp when the log entry was created",
    },
    // updated_by: {
    //   type: DataTypes.INTEGER,
    //   allowNull: true,
    //   comment: "User ID who triggered this log (e.g., a manager)",
    // },
    remarks: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Additional remarks or notes for this log entry",
    },
  },
  {
    sequelize,
    tableName: "schedule_shift_logs",
    timestamps: false,
    comment: "Table for schedule shift logs",
    indexes: [
      {
        name: "schedule_shift_id_idx",
        fields: ["schedule_shift_id"],
      },
      {
        name: "user_id_idx", 
        fields: ["user_id"],
      },
      {
        name: "work_type_id_idx",
        fields: ["work_type_id"],
      },
      {
        name: "log_type_id_idx",
        fields: ["log_type_id"],
      },
    ],
  }
);

// associations
ScheduleShiftLogsModel.belongsTo(ScheduleShiftModel, {
  foreignKey: "schedule_shift_id",
  as: "schedule_shift",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

ScheduleShiftLogsModel.belongsTo(UserModel, {
  foreignKey: "user_id",
  as: "user",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// ScheduleShiftLogsModel.belongsTo(UserModel, {
//   foreignKey: "updated_by",
//   as: "updater",
//   onDelete: "SET NULL",
//   onUpdate: "CASCADE",
// });

ScheduleShiftLogsModel.belongsTo(ScheduleShiftLogTypesModel, {
  foreignKey: "log_type_id",
  as: "log_type", 
  onUpdate: "CASCADE",
});

// association to work types
ScheduleShiftLogsModel.belongsTo(WorkTypeModel, {
  foreignKey: "work_type_id",
  as: "work_type",
  onUpdate: "CASCADE",
});

export default ScheduleShiftLogsModel;
