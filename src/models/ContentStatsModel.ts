import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface ContentStatsAttributes {
  id: number;
  content_id: number;
  content_type: "event" | "news";
  views: number;
  likes: number;
  dislikes: number;
}

interface ContentStatsCreationAttributes
  extends Optional<
    ContentStatsAttributes,
    "id" | "views" | "likes" | "dislikes"
  > {}

export class ContentStatsModel
  extends Model<ContentStatsAttributes, ContentStatsCreationAttributes>
  implements ContentStatsAttributes
{
  public id!: number;
  public content_id!: number;
  public content_type!: "event" | "news";
  public views!: number;
  public likes!: number;
  public dislikes!: number;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ContentStatsModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    content_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    content_type: {
      type: DataTypes.ENUM("event", "news"),
      allowNull: false,
    },
    views: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    likes: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    dislikes: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "content_stats",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["content_id", "content_type"],
      },
    ],
  }
);

export default ContentStatsModel;
