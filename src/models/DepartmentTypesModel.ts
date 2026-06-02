import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class DepartmentTypeModel extends Model {
  public id!: number;
  public name!: string;
  public description!: string | null;
  public is_active!: boolean;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
}

DepartmentTypeModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary Key: Unique ID for each department type',
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Name of the department type (e.g., Ward, OPD)',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description of the department type',
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
      comment: 'Timestamp when the department type was created',
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      // onUpdate: DataTypes.NOW,
      comment: 'Timestamp when the department type was last updated',
    },
  },
  {
    sequelize,
    tableName: 'department_types',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Table for department types',
  }
);

export default DepartmentTypeModel;