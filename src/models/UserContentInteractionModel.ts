import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

type InteractionType = "like" | "dislike";

interface UserContentInteractionAttributes {
  id: number;
  user_id: number;
  content_id: number;
  content_type: "event" | "news";
  interaction_type: InteractionType;
}

interface UserContentInteractionCreationAttributes
  extends Optional<UserContentInteractionAttributes, "id"> {}

export class UserContentInteractionModel
  extends Model<
    UserContentInteractionAttributes,
    UserContentInteractionCreationAttributes
  >
  implements UserContentInteractionAttributes
{
  public id!: number;
  public user_id!: number;
  public content_id!: number;
  public content_type!: "event" | "news";
  public interaction_type!: InteractionType;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

UserContentInteractionModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    content_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    content_type: {
      type: DataTypes.ENUM("event", "news"),
      allowNull: false,
    },
    interaction_type: {
      type: DataTypes.ENUM("like", "dislike"),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "user_content_interactions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["user_id", "content_id", "content_type"],
        name: "user_content_interaction_unique",
      },
    ],
  }
);

export default UserContentInteractionModel;
