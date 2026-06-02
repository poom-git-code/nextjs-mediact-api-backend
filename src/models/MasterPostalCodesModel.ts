import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class MasterPostalCodeModel extends Model {
  public id!: number;
  public code!: string;
  public city_id!: number;
  public created_at!: Date;
  public updated_at!: Date;
}

MasterPostalCodeModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary Key: Unique ID for each postal code',
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Postal code',
    },
    city_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to the city this postal code belongs to',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp when the postal code was created',
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      // onUpdate: DataTypes.NOW,
      comment: 'Timestamp when the postal code was last updated',
    },
  },
  {
    sequelize,
    tableName: 'master_postal_codes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Table for storing master postal code data',
  }
);

export default MasterPostalCodeModel;