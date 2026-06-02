import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import UserModel from './UserModel';
import DepartmentModel from './DepartmentModel';

export class DepartmentOperatingHoursModel extends Model {
  public id!: number;
  public department_id!: number;
  public weekday!: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  public start_time!: string;
  public end_time!: string;
  public is_active!: boolean;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;

  // Optional properties for associations
  public department?: DepartmentModel;
  public created_by_user?: UserModel;
  public updated_by_user?: UserModel;
}

DepartmentOperatingHoursModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary key',
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to departments.id',
    },
    weekday: {
      type: DataTypes.ENUM('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'),
      allowNull: false,
      comment: 'Day of the week',
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
      comment: 'Opening time',
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
      comment: 'Closing time',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether this time slot is active',
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'User ID who created the record',
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'User ID who last updated the record',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Created timestamp',
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Last updated timestamp',
    },
  },
  {
    sequelize,
    tableName: 'department_operating_hours',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Operating hours for each department by weekday and time range',
  }
);

// Define associations
DepartmentOperatingHoursModel.belongsTo(DepartmentModel, { 
  as: 'department', 
  foreignKey: 'department_id' 
});

DepartmentOperatingHoursModel.belongsTo(UserModel, { 
  as: 'created_by_user', 
  foreignKey: 'created_by' 
});

DepartmentOperatingHoursModel.belongsTo(UserModel, { 
  as: 'updated_by_user', 
  foreignKey: 'updated_by' 
});

export default DepartmentOperatingHoursModel;
