import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class HealthRegionsModel extends Model {
  public id!: number;
  public region_code!: string;
  public region_name_th!: string;
  public region_name_en!: string;
  // public provinces?: any;
}

HealthRegionsModel.init(
  {
    id: {
      type: DataTypes.TINYINT.UNSIGNED,
      primaryKey: true,
      allowNull: false,
      comment: '1..13',
    },
    region_code: {
      type: DataTypes.CHAR(2),
      allowNull: false,
      comment: '01..13 ตามลำดับ',
    },
    region_name_th: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    region_name_en: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'health_regions',
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    comment: 'Health regions mapping (1..13)',
  }
);

export default HealthRegionsModel;
