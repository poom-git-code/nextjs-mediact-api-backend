import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class ShiftTypeGroupTagModel extends Model {
  public id!: number;
  public shift_type_id!: number;
  public user_group_tag_id!: number;
  public min_count!: number;
  public priority_level!: number;
  public is_primary_group!: boolean;
  public is_active!: boolean;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
}

ShiftTypeGroupTagModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary Key: Unique ID for each shift type group tag",
    },
    shift_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Reference to the shift type",
    },
    user_group_tag_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Reference to the user group tag",
    },
    min_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Minimum required count for this group tag (0 = no requirement)",
    },
    priority_level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "Priority level for shift assignment (1 = highest, higher number = lower priority)",
    },
    is_primary_group: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Whether this group is the primary group for this shift type",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Group tag assignment status: true = active, false = inactive",
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
      comment: "Timestamp when the record was created",
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: "Timestamp when the record was last updated",
    },
  },
  {
    sequelize,
    tableName: "shift_type_group_tags",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "Table for shift type group tag assignments",
    indexes: [
      {
        unique: true,
        fields: ["shift_type_id", "user_group_tag_id"],
        name: "unique_shift_type_group_tag"
      }
    ]
  }
);

export default ShiftTypeGroupTagModel;
