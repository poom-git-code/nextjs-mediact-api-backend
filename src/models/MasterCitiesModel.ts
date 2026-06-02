import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class MasterCityModel extends Model {
  public id!: number;
  public name!: string;
  public state_id!: number;
  public country_code!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

MasterCityModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary Key: Unique ID for each city',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Name of the city',
    },
    state_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to the state this city belongs to',
    },
    country_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: 'Reference to the country this city belongs to',
    },
  },
  {
    sequelize,
    tableName: 'master_cities',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Table for storing master city data',
  }
);

export default MasterCityModel;