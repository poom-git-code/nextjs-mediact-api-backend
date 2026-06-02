import { DataTypes, Model, Association } from "sequelize";
import { sequelize } from "../config/database";
import Rewards from "./checkinRewardsModel";

export class RewardTypes extends Model {
  public id!: number;
  public name_th!: string;
  public name_en!: string;
  public description!: string;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
  public created_by!: number;
  public updated_by!: number;

  public static associations: {
    Rewards: Association<RewardTypes, Rewards>;
  };
}

RewardTypes.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name_th: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ชื่อประเภท (ภาษาไทย)",
    },
    name_en: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ชื่อประเภท (ภาษาอังกฤษ)",
    },
    description: {
      type: DataTypes.TEXT,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    created_by: {
      type: DataTypes.INTEGER,
    },
    updated_by: {
      type: DataTypes.INTEGER,
    },
  },
  {
    sequelize,
    modelName: "RewardTypes",
    tableName: "checkIn_reward_types",
    timestamps: false,
  }
);

// RewardTypes.hasMany(Rewards, {
//   foreignKey: "type_id",
//   as: "Rewards",
// });

export default RewardTypes;
