import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class ActivityLogModel extends Model {
  public id!: number;
  public user_id!: number | null;
  public action!: string;
  public module!: string;
  public ip_address!: string | null;
  public created_at!: Date;
}

ActivityLogModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary Key: Unique ID for each log entry',
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Reference to the user who performed the action (if applicable)',
    },
    action: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Description of the action performed',
    },
    module: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Module or section of the system affected',
    },
    ip_address: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'IP address of the user performing the action',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp when the action occurred',
    },
  },
  {
    sequelize,
    tableName: 'activity_logs',
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
    comment: 'Table for activity logs in the system',
  }
);

export default ActivityLogModel;