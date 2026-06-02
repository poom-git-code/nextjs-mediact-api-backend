import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class EducationInstitutionModel extends Model {
  public id!: number;
  public name!: string;
  public country_code!: string;
  public is_active!: boolean;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
}

EducationInstitutionModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary Key: Unique ID for each institution',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      comment: 'Name of the institution (e.g., Chulalongkorn University, Harvard)',
    },
    country_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: 'Country code referencing the Master Country Table (e.g., TH, US)',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Institution status: true = active, false = inactive',
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
      comment: 'Timestamp when the institution was created',
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      // onUpdate: DataTypes.NOW,
      comment: 'Timestamp when the institution was last updated',
    },
  },
  {
    sequelize,
    tableName: 'education_institutions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Table for master data of education institutions',
  }
);

export default EducationInstitutionModel;