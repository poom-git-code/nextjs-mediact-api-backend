import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class HealthRegionProvincesModel extends Model {
  public health_region_id!: number;
  public province_geocode!: string;
  // public province?: any;
}

HealthRegionProvincesModel.init(
  {
    health_region_id: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
    },
    province_geocode: {
      type: DataTypes.CHAR(2),
      allowNull: false,
      primaryKey: true,
      comment: 'DOPA/Geocode 2 หลักจาก master จังหวัด',
    },
  },
  {
    sequelize,
    tableName: 'health_region_provinces',
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    indexes: [
      {
        name: 'idx_province',
        fields: ['province_geocode'],
      },
    ],
    comment: 'Mapping of health region to province geocode',
  }
);

export default HealthRegionProvincesModel;
