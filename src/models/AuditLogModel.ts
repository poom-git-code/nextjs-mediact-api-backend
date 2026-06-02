import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import UserModel from './UserModel';

export interface AuditLogAttributes {
  id?: number;
  user_id?: number | null;
  action: string;
  table_name: string;
  record_id?: number | null;
  old_values?: object;
  new_values?: object;
  changes?: object;
  ip_address?: string;
  user_agent?: string;
  request_url?: string;
  request_method?: string;
  status_code?: number;
  session_id?: string;
  transaction_id?: string;
  auto_audit?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

class AuditLogModel extends Model<AuditLogAttributes> implements AuditLogAttributes {
  public id!: number;
  public user_id?: number;
  public action!: string;
  public table_name!: string;
  public record_id?: number;
  public old_values?: object;
  public new_values?: object;
  public changes?: object;
  public ip_address?: string;
  public user_agent?: string;
  public request_url?: string;
  public request_method?: string;
  public status_code?: number;
  public session_id?: string;
  public transaction_id?: string;
  public auto_audit?: boolean;
  public created_at!: Date;
  public updated_at!: Date;

  // Association
  public user?: UserModel;
}

AuditLogModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    table_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    record_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    old_values: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    new_values: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    changes: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    request_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    request_method: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    status_code: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    session_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    transaction_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    auto_audit: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "audit_logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ['user_id'] },
      { fields: ['action'] },
      { fields: ['table_name'] },
      { fields: ['record_id'] },
      { fields: ['created_at'] },
      { fields: ['auto_audit'] },
      { fields: ['session_id'] },
    ],
  }
);

export default AuditLogModel;
