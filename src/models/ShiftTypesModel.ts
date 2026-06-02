import { Association, DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import DepartmentModel from "./DepartmentModel";
import FacilityModel from "./FacilitiesModel";

export class ShiftTypeModel extends Model {
  public id!: number;
  public name!: string;
  public start_time!: string;
  public end_time!: string;
  public roles_allowed!: string;
  public department_id!: number | null;
  public facility_id!: number | null;
  public short_name!: string | null;
  public color_code!: string | null;
  public total_hours!: number | null;
  public normal_hours!: number | null;
  public ot_hours!: number | null;
  public count_as_fte!: boolean;
  public count_as_working_hour!: boolean;
  public min_staff_weekday!: number | null;
  public max_staff_weekday!: number | null;
  public min_staff_weekend!: number | null;
  public max_staff_weekend!: number | null;
  public required_senior_count!: number;
  public is_manual!: boolean;
  public is_default!: boolean;
  public is_active!: boolean;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;

  public department?: DepartmentModel; // Add user_role property
  public facility?: FacilityModel; // Add user_role property

  public static associations: {
    department: Association<DepartmentModel, DepartmentModel>;
    facility: Association<FacilityModel, FacilityModel>;
  };
}

ShiftTypeModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary Key: Unique ID for each shift type",
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Name of the shift type",
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
      comment: "Start time of the shift",
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
      comment: "End time of the shift",
    },
    roles_allowed: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Comma-separated list of roles allowed for this shift",
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Reference to the department this shift belongs to",
    },
    facility_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Reference to the facility this shift belongs to",
    },
    short_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Abbreviated name or label of the shift type (e.g., M, E, N)",
    },
    color_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: "Color code for UI display (e.g., #FF5733)",
    },
    total_hours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: "Total working hours of the shift (including OT)",
    },
    normal_hours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: "Regular working hours (excluding OT)",
    },
    ot_hours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: "Overtime hours for the shift",
    },
    count_as_fte: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Whether this shift counts toward FTE calculation",
    },
    count_as_working_hour: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Whether this shift counts toward total working hours",
    },
    min_staff_weekday: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Minimum number of staff required on normal weekdays",
    },
    max_staff_weekday: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Maximum number of staff allowed on normal weekdays",
    },
    min_staff_weekend: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Minimum number of staff required on weekends/holidays",
    },
    max_staff_weekend: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Maximum number of staff allowed on weekends/holidays",
    },
    required_senior_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Number of senior staff required in this shift",
    },
    is_manual: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Whether this shift is manually created",
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Whether this shift type is a default system-generated shift type",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Shift type status: true = active, false = inactive",
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
      comment: "Timestamp when the shift type was created",
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      // onUpdate: DataTypes.NOW,
      comment: "Timestamp when the shift type was last updated",
    },
  },
  {
    sequelize,
    tableName: "shift_types",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "Table for shift types",
  }
);

// Define associations
ShiftTypeModel.belongsTo(DepartmentModel, {
  foreignKey: "department_id",
  targetKey: "id",
  as: "department",
});
ShiftTypeModel.belongsTo(FacilityModel, {
  foreignKey: "facility_id",
  targetKey: "id",
  as: "facility",
});

export default ShiftTypeModel;
