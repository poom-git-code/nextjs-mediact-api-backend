import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class EducationModel extends Model {
  public id!: number;
  public user_id!: number;
  public degree_id!: number;
  public institution_id!: number;
  public field_of_study!: string | null;
  public document_url!: string | null;
  public is_active!: boolean;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
  public start_date!: Date | null;
  public graduate_date!: Date | null;
}

EducationModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary Key: Unique ID for each education',
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to the user this education belongs to',
    },
    degree_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to the degree type from education_degrees',
    },
    institution_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to the institution from education_institutions',
    },
    field_of_study: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Field of study (e.g., Medicine, Engineering)',
    },
    document_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'URL to the supporting document (e.g., certificate)',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Education status: true = active, false = inactive',
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
      comment: 'Timestamp when the education was added',
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp when the education was last updated',
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when the education started',
    },
    graduate_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when the education was completed',
    },
  },
  {
    sequelize,
    tableName: 'educations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Table for storing user educations',
  }
);

export default EducationModel;