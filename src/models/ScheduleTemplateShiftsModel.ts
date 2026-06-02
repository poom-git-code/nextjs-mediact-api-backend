import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class ScheduleTemplateShiftModel extends Model {
  public id!: number;
  public template_id!: number;
  public shift_type_id!: number;
  public day_of_week!: number;
  public start_time!: string;
  public end_time!: string;
  public roles_allowed!: string | null;
  public is_active!: boolean;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
}

ScheduleTemplateShiftModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary Key: Unique ID for each template shift',
    },
    template_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to the schedule template this shift belongs to',
    },
    shift_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to the type of shift (e.g., Morning, Night)',
    },
    day_of_week: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: 'Day of the week for this shift (0 = Sunday, 6 = Saturday)',
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
      comment: 'Start time of the shift',
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
      comment: 'End time of the shift',
    },
    roles_allowed: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Comma-separated list of roles allowed for this shift',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Template shift status: true = active, false = inactive',
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
      comment: 'Timestamp when the template shift was created',
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      // onUpdate: DataTypes.NOW,
      comment: 'Timestamp when the template shift was last updated',
    },
  },
  {
    sequelize,
    tableName: 'schedule_template_shifts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Table for storing shift details in schedule templates',
  }
);

export default ScheduleTemplateShiftModel;