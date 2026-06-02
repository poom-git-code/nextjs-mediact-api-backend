import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class ShiftTypeRoleModel extends Model {
  public id!: number;
  public shift_type_id!: number;
  public role_id!: number;
  public min_count!: number | null;
  public max_count!: number | null;
  public min_count_weekday!: number | null;
  public max_count_weekday!: number | null;
  public min_count_weekend!: number | null;
  public max_count_weekend!: number | null;
  public is_active!: boolean;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
}

ShiftTypeRoleModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: "Primary Key: Unique ID for each shift type role",
    },
    shift_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Reference to the shift type",
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Reference to the role",
    },
    min_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Minimum required count for this role in the shift type",
    },
    max_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Maximum allowed count for this role in the shift type",
    },
    min_count_weekday: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Minimum required count for this role on weekdays",
    },
    max_count_weekday: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Maximum allowed count for this role on weekdays",
    },
    min_count_weekend: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Minimum required count for this role on weekends",
    },
    max_count_weekend: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Maximum allowed count for this role on weekends",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Role assignment status: true = active, false = inactive",
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
    tableName: "shift_type_roles",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "Table for shift type role assignments",
    indexes: [
      {
        unique: true,
        fields: ["shift_type_id", "role_id"],
        name: "unique_shift_type_role"
      }
    ]
  }
);

export default ShiftTypeRoleModel;
