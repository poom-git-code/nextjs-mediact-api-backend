import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import ContentStatsModel from "./ContentStatsModel";

export class NewsModel extends Model {
  public id!: number;
  public title!: string;
  public content!: string | null;
  public category!: string | null;
  public image_url!: string | null;
  public url!: string | null;
  public role_tags!: string | null;
  public is_active!: boolean;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
}

NewsModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "Unique identifier for the news article",
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Title of the news article",
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Content of the news article",
    },
    category: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Category of the news (e.g., business, entertainment)",
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "URL of the news article image",
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "URL for the news article source",
    },
    role_tags: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Role of user that can see this content",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "News status: true = active, false = inactive",
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ID of the user who created the news article",
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ID of the user who last updated the news article",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: "Timestamp when the news article was created",
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      // onUpdate: DataTypes.NOW,
      comment: "Timestamp when the news article was last updated",
    },
  },
  {
    sequelize,
    tableName: "news",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "Table for storing company news",
  }
);

NewsModel.hasOne(ContentStatsModel, {
  foreignKey: "content_id",
  constraints: false,
  as: "stats",
  scope: {
    content_type: "news",
  },
});

ContentStatsModel.belongsTo(NewsModel, {
  foreignKey: "content_id",
  constraints: false,
  as: "news",
});

export default NewsModel;
