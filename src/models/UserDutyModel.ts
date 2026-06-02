import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class UserDutyModel extends Model {
  public id!: number;
  public user_id!: number;
  public duty_date!: Date;
  public duty_type_id!: number;
  public reference_id!: number | null;
  public shift_type_id!: number | null;
  public start_time!: string | null;
  public end_time!: string | null;
  public total_hours!: number | null;
  public status!: string | null;
  public department_id!: number | null;
  public schedule_master_id!: number | null;
  public is_active!: boolean;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserDutyModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary key',
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to the user',
    },
    duty_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Date of the duty (one row per duty event)',
    },
    duty_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to duty_types.id (no FK constraint)',
    },
    reference_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: 'Reference to the original record (e.g., shift_id, leave_id)',
    },
    shift_type_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'If duty_type = shift, reference to shift type',
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: 'Start time of duty',
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: 'End time of duty',
    },
    total_hours: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: 'Number of hours this duty spans',
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Status of the duty record',
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Department associated with the duty',
    },
    schedule_master_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Schedule month this duty belongs to',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Soft delete flag',
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
    modelName: 'UserDuty',
    tableName: 'user_duty',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Daily duty log for each user with link to duty type (without FK)',
    indexes: [
      {
        name: 'idx_user_duty_date',
        fields: ['user_id', 'duty_date'],
      },
      {
        name: 'idx_user_duty_type',
        fields: ['duty_type_id'],
      },
      {
        name: 'idx_user_duty_status',
        fields: ['status'],
      },
      {
        name: 'idx_user_duty_department',
        fields: ['department_id'],
      },
      {
        name: 'idx_user_duty_schedule',
        fields: ['schedule_master_id'],
      },
      {
        name: 'idx_user_duty_is_active',
        fields: ['is_active'],
      },
      {
        name: 'idx_user_duty_created_by',
        fields: ['created_by'],
      },
      {
        name: 'idx_user_duty_updated_by',
        fields: ['updated_by'],
      },
      {
        name: 'idx_user_duty_reference',
        fields: ['reference_id'],
      },
      {
        name: 'idx_user_duty_shift_type',
        fields: ['shift_type_id'],
      },
    ],
  }
);

export default UserDutyModel;
