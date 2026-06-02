import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export class EventRewardModel extends Model {
  public id!: number;
  public booth_event_id!: number;
  public user_id!: number;
  public redeemed_at!: Date;
}

EventRewardModel.init(
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
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    redeemed_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "event_rewards",
    timestamps: false,
  }
);

export default EventRewardModel;
