import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class UserLogModel extends Model {
  public id!: number;
  public user_id!: number;
  public action!: string;
  public changes!: string | null;
  public performed_by!: number;
  public performed_at!: Date;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
}

UserLogModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary Key: Unique identifier for each log entry',
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Identifier for the user this log relates to',
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Description of the action performed (e.g., Created, Updated, Deleted)',
    },
    changes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Details of the changes made, typically in JSON format',
    },
    performed_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Identifier for the user who performed the action',
    },
    performed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp when the action was performed',
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
      comment: 'Timestamp when the log entry was created',
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      // onUpdate: DataTypes.NOW,
      comment: 'Timestamp when the log entry was last updated',
    },
  },
  {
    sequelize,
    tableName: 'user_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Table for logging actions performed by users in the system',
  }
);

export default UserLogModel;