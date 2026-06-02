import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import UserModel from "./UserModel";
import ShiftTypeModel from "./ShiftTypesModel";
import FacilityModel from "./FacilitiesModel";
import DepartmentModel from "./DepartmentModel";

export class ScheduleShiftModel extends Model {
  public id!: number;
  public schedule_master_id!: number;
  public shift_type_id!: number;
  public employee_id!: number;
  public facility_id!: number;
  public department_id!: number;
  public shift_date!: Date;
  public status_id!: number;
  public start_time!: string | null;
  public end_time!: string | null;
  public total_hours!: number | null;
  public normal_hours!: number | null;
  public ot_hours!: number | null;
  public is_overtime!: boolean;
  public is_replacement!: boolean;
  public replaced_employee_id!: number | null;
  public actual_check_in!: Date | null;
  public actual_check_out!: Date | null;
  public late_minutes!: number;
  public early_leave_minutes!: number;
  public init_employee_id!: number;

  public is_job_broadcast!: boolean;
  public job_apply_id!: number | null;

  public remarks!: string | null;
  public is_active!: boolean;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
}

ScheduleShiftModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary Key: Unique ID for each schedule shift entry",
    },
    schedule_master_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Reference to the schedule master this shift belongs to",
    },
    shift_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Reference to the type of shift (e.g., Morning, Night)",
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Reference to the employee assigned to this shift",
    },
    facility_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Reference to the facility where the shift is scheduled",
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Reference to the department where the shift is scheduled",
    },
    shift_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Date of the shift",
    },
    status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Reference to the shift status (e.g., Scheduled, Completed)",
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: "Start time of the shift (snapshot from shift_types)",
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: "End time of the shift (snapshot from shift_types)",
    },
    total_hours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: "Total hours of this shift",
    },
    normal_hours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: "Normal working hours (excluding OT)",
    },
    ot_hours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: "Overtime hours (if any)",
    },
    is_overtime: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Flag indicating if this is an overtime shift",
    },
    is_replacement: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Flag if this shift is assigned as replacement",
    },
    replaced_employee_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Employee ID who was originally assigned this shift",
    },
    actual_check_in: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Actual check-in time",
    },
    actual_check_out: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Actual check-out time",
    },
    late_minutes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Number of minutes late to check in",
    },
    early_leave_minutes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Number of minutes left before shift end",
    },
    init_employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Original employee ID assigned to this shift',
    },

    is_job_broadcast: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Flag indicating if this shift was created from a job application approval",
    },
    job_apply_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Reference to the job_applies table (if created from job)",
    },


    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Additional notes or remarks for this shift",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Department status: true = active, false = inactive",
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "User ID of the creator who created this record",
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "User ID of the last updater who updated this record",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: "Timestamp when the schedule shift was created",
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: "Timestamp when the schedule shift was last updated",
    },
  },
  {
    sequelize,
    tableName: "schedule_shifts",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "Table for storing schedule shift details",
  }
);

// Define associations
// Note: employee and shift_type associations are now defined in associations.ts
ScheduleShiftModel.belongsTo(UserModel, {
  foreignKey: "replaced_employee_id",
  as: "replacedEmployee",
});
ScheduleShiftModel.belongsTo(FacilityModel, {
  foreignKey: "facility_id",
  as: "facility",
});
ScheduleShiftModel.belongsTo(DepartmentModel, {
  foreignKey: "department_id",
  as: "department",
});

export default ScheduleShiftModel;
