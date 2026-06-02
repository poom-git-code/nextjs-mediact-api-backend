import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import ContentStatsModel from "./ContentStatsModel";

export class EventModel extends Model {
  public id!: number;
  public title!: string;
  public description!: string | null;
  public content!: string | null;
  public start_date!: Date | null;
  public end_date!: Date | null;
  public location!: string | null;
  public max_participants!: number | null;
  public image_url!: string | null;
  public url!: string | null;
  public contact_name!: string | null;
  public contact_email!: string | null;
  public contact_phone!: string | null;
  public role_tags!: string | null;
  public is_active!: boolean;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
}

EventModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "Unique identifier for the event",
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Title of the event",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Short description of the event",
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Detailed content of the event",
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Start date and time of the event",
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "End date and time of the event",
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Location where the event is held",
    },
    max_participants: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Maximum number of participants for the event",
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "URL for the event image",
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "URL for the event source or reference",
    },
    contact_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Name of the contact person for the event",
    },
    contact_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Email of the contact person",
    },
    contact_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "Phone number of the contact person",
    },
    role_tags: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Role of user that can see this content",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Event status: true = active, false = inactive",
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ID of the user who created the event",
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ID of the user who last updated the event",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: "Timestamp when the event was created",
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: "Timestamp when the event was last updated",
    },
  },
  {
    sequelize,
    tableName: "events",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "Table for storing event information",
  }
);

EventModel.hasOne(ContentStatsModel, {
  foreignKey: "content_id",
  constraints: false,
  as: "stats",
  scope: {
    content_type: "event",
  },
});

ContentStatsModel.belongsTo(EventModel, {
  foreignKey: "content_id",
  constraints: false,
  as: "event",
});

export default EventModel;
