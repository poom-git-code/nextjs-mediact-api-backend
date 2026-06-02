import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import AdsModel from './AdsModel';

export class AdTypeModel extends Model {
  public id!: number;
  public name!: string;
  public description!: string | null;
  public is_active!: boolean;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
}

AdTypeModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Unique identifier for the ad type',
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Name of the ad type',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description of the ad type',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Type status: true = active, false = inactive",
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the user who created the advertisement',
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the user who last updated the advertisement',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp when the advertisement was created',
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp when the advertisement was last updated',
    },
  },
  {
    sequelize,
    tableName: 'ad_type',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Table of advertisement types',
  }
);

// AdTypeModel.hasMany(AdsModel, {
//   foreignKey: 'ad_type_id',
//   as: 'ads',
//   sourceKey: 'id',
// });

export default AdTypeModel;
