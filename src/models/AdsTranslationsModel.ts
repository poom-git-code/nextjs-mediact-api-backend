import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class AdsTranslationModle extends Model {
  public id!: number;
  public ad_id!: number;
  public language_code!: string;
  public title!: string;
  public description!: string | null;
  public created_at!: Date;
  public updated_at!: Date;
}

AdsTranslationModle.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Unique identifier for the translation',
    },
    ad_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Advertisement ID this translation belongs to',
    },
    language_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: 'Language code of the translation (e.g., en, th)',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Title of the advertisement in the specific language',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description of the advertisement in the specific language',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp when the translation was created',
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      // onUpdate: DataTypes.NOW,
      comment: 'Timestamp when the translation was last updated',
    },
  },
  {
    sequelize,
    tableName: 'ads_translations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Table for storing advertisement translations',
    indexes: [
      {
        unique: true,
        fields: ['ad_id', 'language_code'],
        name: 'unique_ad_language',
      },
    ],
  }
);

export default AdsTranslationModle;