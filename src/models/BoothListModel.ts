import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export class BoothEventListModel extends Model {
  public id!: number;
  public booth_event_id!: number;
  public stamp_code!: string;
  public booth_name!: string;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
}

BoothEventListModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    booth_event_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    stamp_code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    booth_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
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
    tableName: "booth_list",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default BoothEventListModel;
