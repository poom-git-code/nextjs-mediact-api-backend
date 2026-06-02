import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class UserGroupTagMemberModel extends Model {
  public id!: number;
  public user_group_tag_id!: number;
  public user_id!: number;
  public is_active!: boolean;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
}

UserGroupTagMemberModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary Key: Unique ID for each user group tag member",
    },
    user_group_tag_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Reference to the user group tag",
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Reference to the user",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Member status: true = active, false = inactive",
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "User ID of the creator who created this record",
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "User ID of the last updater who updated this record",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: "Timestamp when the member was created",
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: "Timestamp when the member was last updated",
    },
  },
  {
    sequelize,
    tableName: "user_group_tag_members",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "Table for user group tag members",
    indexes: [
      {
        unique: true,
        fields: ["user_group_tag_id", "user_id"],
        name: "unique_user_group_tag_member"
      }
    ]
  }
);

export default UserGroupTagMemberModel;
