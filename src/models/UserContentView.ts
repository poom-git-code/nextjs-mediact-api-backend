import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface UserContentViewAttributes {
  id: number;
  user_id: number;
  content_id: number;
  content_type: "event" | "news";
}

interface UserContentViewCreationAttributes
  extends Optional<UserContentViewAttributes, "id"> {}

export class UserContentViewModel
  extends Model<UserContentViewAttributes, UserContentViewCreationAttributes>
  implements UserContentViewAttributes
{
  public id!: number;
  public user_id!: number;
  public content_id!: number;
  public content_type!: "event" | "news";

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

UserContentViewModel.init(
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
  },
  {
    sequelize,
    tableName: "user_content_views",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["user_id", "content_id", "content_type"],
        name: "user_content_view_unique",
      },
    ],
  }
);

export default UserContentViewModel;
