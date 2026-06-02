import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class ScheduleShiftSummaryModel extends Model {
  public id!: number;
  public schedule_master_id!: number;
  public department_id!: number;
  public shift_type_id!: number;
  public total_shifts!: number;
  public total_hours!: number;
  public total_normal_hours!: number;
  public total_ot_hours!: number;
  public total_employees!: number;
  public is_active!: boolean;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;

  // Virtual fields for associations
  public ScheduleMaster?: any;
  public Department?: any;
  public ShiftType?: any;
  public Creator?: any;
  public Updater?: any;
}

ScheduleShiftSummaryModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary key',
    },
    schedule_master_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to schedule_master.id',
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Department this summary belongs to',
    },
    shift_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Shift type (e.g., Morning, Night)',
    },
    total_shifts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of shifts in this month of this type',
    },
    total_hours: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Total working hours for this shift type',
    },
    total_normal_hours: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Total regular hours (no OT)',
    },
    total_ot_hours: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Total overtime hours',
    },
    total_employees: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of employees scheduled for this shift type',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Is this summary active',
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'User ID who created this record',
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'User ID who last updated this record',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Record creation timestamp',
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Record last update timestamp',
    },
  },
  {
    sequelize,
    modelName: 'ScheduleShiftSummary',
    tableName: 'schedule_shift_summary',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Monthly summary of shifts by shift type per department',
    indexes: [
      {
        name: 'idx_schedule_shift_summary_schedule_master',
        fields: ['schedule_master_id'],
      },
      {
        name: 'idx_schedule_shift_summary_department',
        fields: ['department_id'],
      },
      {
        name: 'idx_schedule_shift_summary_shift_type',
        fields: ['shift_type_id'],
      },
      {
        name: 'idx_schedule_shift_summary_is_active',
        fields: ['is_active'],
      },
      {
        name: 'uniq_summary',
        fields: ['schedule_master_id', 'shift_type_id'],
        unique: true,
      },
    ],
  }
);

export default ScheduleShiftSummaryModel;
