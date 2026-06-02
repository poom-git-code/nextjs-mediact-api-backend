import { DataTypes, Model, Association } from "sequelize";
import { sequelize } from "../config/database";
import RewardTypes from "./checkinRewardTypesModel";
import Brands from "./BrandsModel";

export class Rewards extends Model {
  public id!: number;
  public title!: string;
  public description!: string;
  public conditions!: string | null;
  public image_url!: string;
  public redeem_code!: string | null;
  public points_required!: number;
  public expiry_date!: Date | null;
  public is_active!: boolean;
  public stock_quantity!: number;
  public type_id!: number;
  public brand_id!: number | null;

  public status_redeem!: string; // 'available', 'redeemed'
  public redeem_date!: Date | null;

  public created_by!: number | null;
  public updated_by!: number | null;
  public created_at!: Date;
  public updated_at!: Date;

  public reward_type?: RewardTypes;
  public brand?: Brands;

  public static associations: {
    reward_type: Association<Rewards, RewardTypes>;
    brand: Association<Rewards, Brands>;
  };
}

Rewards.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    conditions: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "เงื่อนไขและข้อกำหนดของรางวัล",
    },
    image_url: {
      type: DataTypes.STRING(500),
    },
    redeem_code: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "รหัสสำหรับแลกรับรางวัล",
    },
    points_required: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    expiry_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "วันที่ของรางวัลนี้จะหมดอายุ (ถ้ามี)",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: -1, // -1 = unlimited
    },
    type_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    brand_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "FK อ้างอิงถึงตาราง brands",
    },

    status_redeem: {
      type: DataTypes.STRING(20),
      defaultValue: "available", // available = ยังไม่แลก, redeemed = แลกแล้ว
      allowNull: false,
      comment: "สถานะการถูกแลก (available, redeemed)",
    },
    redeem_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "วันที่และเวลาที่ถูกแลกไป",
    },

    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Rewards",
    tableName: "checkIn_rewards",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Rewards;
