import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import UserModel from './UserModel';
import DepartmentModel from './DepartmentModel';

export class DepartmentSupervisorModel extends Model {
  public id!: number;
  public department_id!: number;
  public user_id!: number;
  public role!: 'head' | 'assistant' | 'secretary';
  public is_active!: boolean;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;

  // Optional properties for associations
  public user?: UserModel;
  public department?: DepartmentModel;
  public created_by_user?: UserModel;
  public updated_by_user?: UserModel;
}

DepartmentSupervisorModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary key',
    },
    department_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Reference to departments.id',
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Reference to users.id',
    },
    role: {
      type: DataTypes.ENUM('head', 'assistant', 'secretary'),
      defaultValue: 'head',
      comment: 'Role of the supervisor',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether the supervisor is currently active',
    },
    created_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: 'User ID of the creator',
    },
    updated_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: 'User ID of the last updater',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Created timestamp',
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Updated timestamp',
    },
  },
  {
    sequelize,
    tableName: 'department_supervisors',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Table for department supervisors or leads',
  }
);

// Define associations
DepartmentSupervisorModel.belongsTo(UserModel, { 
  as: 'user', 
  foreignKey: 'user_id' 
});

DepartmentSupervisorModel.belongsTo(DepartmentModel, { 
  as: 'department', 
  foreignKey: 'department_id' 
});

DepartmentSupervisorModel.belongsTo(UserModel, { 
  as: 'created_by_user', 
  foreignKey: 'created_by' 
});

DepartmentSupervisorModel.belongsTo(UserModel, { 
  as: 'updated_by_user', 
  foreignKey: 'updated_by' 
});

export default DepartmentSupervisorModel;
