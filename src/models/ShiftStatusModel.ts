import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class ShiftStatusModel extends Model {
  public id!: number;
  public name!: string;
  public description!: string | null;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
  public created_by!: number | null;
  public updated_by!: number | null;
}

ShiftStatusModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary Key: Unique ID for each schedule status',
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Name of the status (e.g., Draft, Published, Edited, Cancelled)',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description of the status',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Status activity: true = active, false = inactive',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp when the status was created',
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp when the status was last updated',
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
  },
  {
    sequelize,
    tableName: 'shift_statuses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Table for schedule statuses',
  }
);

export default ShiftStatusModel;
