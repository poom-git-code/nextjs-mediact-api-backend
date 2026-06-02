import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class ScheduleHistoryModel extends Model {
  public id!: number;
  public schedule_master_id!: number;
  public action!: string;
  public status_id!: number;
  public user_id!: number;
  public remarks!: string | null;
  public created_at!: Date;
}

ScheduleHistoryModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary Key: Unique ID for each history entry',
    },
    schedule_master_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to the schedule master this history belongs to',
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Action performed (e.g., Drafted, Published, Edited, Cancelled)',
    },
    status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to the status of the schedule after this action',
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to the user who performed the action',
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional notes or remarks about the action',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp when the action was performed',
    },
  },
  {
    sequelize,
    tableName: 'schedule_history',
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
    comment: 'Table for storing schedule master change history',
  }
);

export default ScheduleHistoryModel;