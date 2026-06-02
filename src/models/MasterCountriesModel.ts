import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class MasterCountryModel extends Model {
  public id!: number;
  public code!: string;
  public name!: string;
  public region!: string | null;
  public sub_region!: string | null;
  public latitude!: number | null;
  public longitude!: number | null;
  public phone_code!: string | null;
  public is_active!: boolean;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
}

MasterCountryModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary Key: Unique ID for each country',
    },
    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      comment: 'Unique country code (e.g., TH for Thailand, US for United States)',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      comment: 'Full name of the country (e.g., Thailand, United States)',
    },
    region: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Region where the country is located (e.g., Asia, Europe)',
    },
    sub_region: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Sub-region of the country (e.g., Southeast Asia, Northern Europe)',
    },
    latitude: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: true,
      comment: 'Latitude coordinate of the country (e.g., center point)',
    },
    longitude: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: true,
      comment: 'Longitude coordinate of the country (e.g., center point)',
    },
    phone_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'International phone code of the country (e.g., +66 for Thailand)',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Country status: true = active, false = inactive',
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
      comment: 'Timestamp when the country was added',
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      // onUpdate: DataTypes.NOW,
      comment: 'Timestamp when the country was last updated',
    },
  },
  {
    sequelize,
    tableName: 'master_countries',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Master table for storing country details',
  }
);

export default MasterCountryModel;