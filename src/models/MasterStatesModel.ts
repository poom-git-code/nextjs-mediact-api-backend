import { DataTypes, Model } from 'sequelize';
import { sequelize }  from '../config/database';

export class MasterStateModel extends Model {
  public id!: number;
  public name!: string;
  public country_code!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

MasterStateModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary Key: Unique ID for each state',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Name of the state',
    },
    country_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: 'Reference to the country this state belongs to',
    },
  },
  {
    sequelize,
    tableName: 'master_states',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Table for storing master state data',
  }
);

export default MasterStateModel;