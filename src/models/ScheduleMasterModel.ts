import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class ScheduleMasterModel extends Model {
  public id!: number;
  public department_id!: number;
  public facility_id!: number;
  public date!: Date;
  public month!: number;
  public year!: number;
  public status_id!: number;
  public department_name!: string | null;
  public total_working_days!: number | null;
  public working_hours_per_person!: number | null;
  public total_dayoffs!: number | null;
  public total_holidays!: number | null;
  public total_fte!: number | null;
  public total_shifts_needed!: number | null;
  public total_working_hours_required!: number | null;
  public total_members!: number | null;
  public total_regular_hours_available!: number | null;
  public total_ot_hours_required!: number | null;
  public additional_members_required!: number | null;
  public is_active!: boolean;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
}

ScheduleMasterModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary Key: Unique ID for each schedule master entry',
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to the department this schedule belongs to',
    },
    facility_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to the facility this schedule belongs to',
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Date of the schedule',
    },
    month: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: 'Month of the schedule (1-12)',
    },
    year: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      comment: 'Year of the schedule',
    },
    status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to the current status of the schedule (e.g., Draft, Published)',
    },
    department_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Name of the department for redundancy/reporting',
    },
    total_working_days: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Total number of working days in the month',
    },
    working_hours_per_person: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: 'Planned working hours per person in this month',
    },
    total_dayoffs: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Total number of day-offs for the month (days not scheduled)',
    },
    total_holidays: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Total number of official holidays in the month',
    },
    total_fte: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: 'Total calculated FTE for the schedule',
    },
    total_shifts_needed: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Total number of shifts needed for the department in the month',
    },
    total_working_hours_required: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Total working hours required for the department in the month',
    },
    total_members: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Total number of assigned staff in the department',
    },
    total_regular_hours_available: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Sum of normal hours all members can contribute',
    },
    total_ot_hours_required: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Estimated overtime hours needed to cover gap',
    },
    additional_members_required: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Estimated number of extra members needed to meet coverage',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Department status: true = active, false = inactive',
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'User ID of the creator who created this record',
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'User ID of the last updater who updated this record',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp when the schedule master was created',
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      // onUpdate: DataTypes.NOW,
      comment: 'Timestamp when the schedule master was last updated',
    },
  },
  {
    sequelize,
    tableName: 'schedule_master',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Table for storing schedule master templates',
  }
);

export default ScheduleMasterModel;