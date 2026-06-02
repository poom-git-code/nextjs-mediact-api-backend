import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import UserModel from './UserModel';

export class RefreshTokenModel extends Model {
  public id!: number;
  public user_id!: number;
  public token!: string;
  public expires_at!: Date;
  public is_revoked!: boolean;
  public device_info!: string | null;
  public ip_address!: string | null;
  public created_at!: Date;
  public updated_at!: Date;

  // Optional properties for associations
  public user?: UserModel;
}

RefreshTokenModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary key',
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to users.id',
    },
    token: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
      comment: 'Refresh token string',
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Token expiration date',
    },
    is_revoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether the token has been revoked',
    },
    device_info: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Device information (User-Agent)',
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: 'IP address when token was created',
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
    tableName: 'refresh_tokens',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Table for storing refresh tokens',
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['expires_at']
      },
      {
        fields: ['is_revoked']
      }
    ]
  }
);

// Define associations
RefreshTokenModel.belongsTo(UserModel, { 
  as: 'user', 
  foreignKey: 'user_id' 
});

export default RefreshTokenModel;
