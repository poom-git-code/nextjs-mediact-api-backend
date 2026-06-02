import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class ScheduleTemplateModel extends Model {
  public id!: number;
  public name!: string;
  public description!: string | null;
  public department_id!: number;
  public facility_id!: number;
  public is_active!: boolean;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
}

ScheduleTemplateModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary Key: Unique ID for each schedule template',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Name of the schedule template (e.g., Weekly Shift Template)',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description of the schedule template',
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to the department this template belongs to',
    },
    facility_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to the facility this template belongs to',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Template status: true = active, false = inactive',
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
      comment: 'Timestamp when the template was created',
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      // onUpdate: DataTypes.NOW,
      comment: 'Timestamp when the template was last updated',
    },
  },
  {
    sequelize,
    tableName: 'schedule_templates',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Table for storing schedule templates',
  }
);

export default ScheduleTemplateModel;