import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class EventsTranslationModel extends Model {
  public id!: number;
  public event_id!: number;
  public language_code!: string;
  public title!: string;
  public description!: string | null;
  public created_at!: Date;
  public updated_at!: Date;
}

EventsTranslationModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Unique identifier for the translation',
    },
    event_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Event ID this translation belongs to',
    },
    language_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: 'Language code of the translation (e.g., en, th)',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Title of the event in the specific language',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description of the event in the specific language',
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
    tableName: 'events_translations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Table for storing event translations',
    indexes: [
      {
        unique: true,
        fields: ['event_id', 'language_code'],
        name: 'unique_event_language',
      },
    ],
  }
);

export default EventsTranslationModel;