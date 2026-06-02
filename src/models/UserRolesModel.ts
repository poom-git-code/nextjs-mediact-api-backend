import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import RoleModel from './RolesModel';
import UserModel from './UserModel';

export class UserRoleModel extends Model {
  public id!: number;
  public user_id!: number;
  public role_id!: number;
  public is_active!: boolean;
  public assigned_at!: Date;
}

UserRoleModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary Key: Unique ID for each user-role relationship',
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to the user this role belongs to',
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to the role assigned to the user',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Department status: true = active, false = inactive',
    },
    assigned_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp when the role was assigned',
    },
  },
  {
    sequelize,
    tableName: 'user_roles',
    timestamps: false, // No created_at and updated_at for this table
    comment: 'Table for linking users and roles',
  }
);

UserRoleModel.belongsTo(RoleModel, {
  as: "role",
  foreignKey: "role_id",
  targetKey: "id",
});

export default UserRoleModel;