import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class AnnouncementModel extends Model {
  public id!: number;
  public title!: string;
  public message!: string;
  public target_group!: string | null;
  public priority!: 'normal' | 'important' | 'urgent';
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
}

AnnouncementModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Unique identifier for the announcement',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Title of the announcement',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Content of the announcement',
    },
    target_group: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Target group associated with the announcement',
    },
    priority: {
      type: DataTypes.ENUM('normal', 'important', 'urgent'),
      allowNull: false,
      defaultValue: 'normal',
      comment: 'Priority level of the announcement',
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the user who created the announcement',
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the user who last updated the announcement',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp when the announcement was created',
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      // onUpdate: DataTypes.NOW,
      comment: 'Timestamp when the announcement was last updated',
    },
  },
  {
    sequelize,
    tableName: 'announcements',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Table for storing company announcements',
  }
);

export default AnnouncementModel;