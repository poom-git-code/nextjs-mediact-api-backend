import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export class BoothEventModel extends Model {
  public id!: number;
  public name!: string;
  public type!: "online" | "onsite";
  public start_date!: Date;
  public end_date!: Date;
  public total_stamps_required!: number;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
}

BoothEventModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("online", "onsite"),
      allowNull: false,
      defaultValue: "onsite",
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    total_stamps_required: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "booth_events",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default BoothEventModel;
