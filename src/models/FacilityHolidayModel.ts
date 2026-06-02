import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface FacilityHolidayAttributes {
  id: number;
  facility_id: number;
  holiday_date: Date;
  name: string;
  is_recurring: boolean;
  description?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
  created_at?: Date;
  updated_at?: Date;
}

interface FacilityHolidayCreationAttributes extends Optional<FacilityHolidayAttributes, "id" | "description" | "created_by" | "updated_by" | "created_at" | "updated_at"> {}

class FacilityHolidayModel extends Model<FacilityHolidayAttributes, FacilityHolidayCreationAttributes> implements FacilityHolidayAttributes {
  public id!: number;
  public facility_id!: number;
  public holiday_date!: Date;
  public name!: string;
  public is_recurring!: boolean;
  public description?: string | null;
  public created_by?: number | null;
  public updated_by?: number | null;
  public created_at?: Date;
  public updated_at?: Date;
}

FacilityHolidayModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      comment: "Primary Key",
    },
    facility_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: "ID ของ Facility",
    },
    holiday_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "วันที่หยุด",
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "ชื่อวันหยุด เช่น วันปีใหม่, วันแรงงาน",
    },
    is_recurring: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "1 = หยุดวันเดียวกันทุกปี, 0 = เฉพาะปีนั้น",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "คำอธิบายเพิ่มเติม",
    },
    created_by: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: "User ที่สร้างข้อมูล",
    },
    updated_by: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: "User ที่แก้ไขล่าสุด",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      comment: "เวลาที่สร้างข้อมูล",
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      comment: "เวลาที่อัปเดตล่าสุด",
    },
  },
  {
    sequelize,
    tableName: "facility_holidays",
    timestamps: false,
    underscored: true,
  }
);

export default FacilityHolidayModel;
