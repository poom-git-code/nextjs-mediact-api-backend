import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class FacilityLeaveLimitsModel extends Model {
  public id!: number;
  public facility_id!: number;
  public leave_type_id!: number;
  public max_days!: number;
  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;
}

FacilityLeaveLimitsModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    facility_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    leave_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    max_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "facility_leave_limits",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "Table for facility leave limits configuration",
    indexes: [
      {
        unique: true,
        fields: ["facility_id", "leave_type_id"],
        name: "unique_facility_leave_type",
      },
    ],
  }
);

export default FacilityLeaveLimitsModel;
