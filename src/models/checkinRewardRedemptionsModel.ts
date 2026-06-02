import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import Rewards from "./checkinRewardsModel";
import UserModel from "./UserModel";

export class RewardRedemptions extends Model {
  id!: number;
  user_id!: number;
  reward_id!: number;
  points_used!: number;
  status!: string;
  redeemed_at!: Date;
  expires_at!: Date | null;
  Reward: any;
}

RewardRedemptions.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reward_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    points_used: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "completed", "expired"),
      defaultValue: "pending",
    },
    redeemed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    expires_at: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: "RewardRedemptions",
    tableName: "checkIn_reward_redemptions",
    timestamps: false,
  }
);

// RewardRedemptions.belongsTo(Rewards, {
//   foreignKey: "reward_id",
//   as: "Reward",
// });

// RewardRedemptions.belongsTo(UserModel, {
//   foreignKey: "user_id",
//   as: "User",
// });

export default RewardRedemptions;
